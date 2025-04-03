import client from "../../tina/__generated__/client";
import { getEntireCollection } from "../generic/fetchEntireCollection";
import { addSubpathToSlug } from "./addSubpath";

// Recursive helper for formatting nested TOC items for the mutation
const formatTocItemsRecursive = (tocItemsNode: any, versionNumber: string): any => {
    // Input is a node with { title, items } from the query result (e.g., DocsTableOfContentsSupermenuGroupItemsItems)
    // Output needs to match the corresponding Mutation structure (e.g., DocsTableOfContentsSupermenuGroupItemsItemsMutation)
    return {
      title: tocItemsNode.title,
      items:
        tocItemsNode.items
          ?.map((item: any) => {
            // item is the next level down in the query structure union
            if (!item) return null;
            // Check if it's an Item type (leaf node in this branch) - Ensure slug and id exist
            if (item.slug && typeof item.slug.id === "string") {
              // Return the { item: ... } structure for the Mutation union
              return {
                item: {
                  title: item.title,
                  slug: addSubpathToSlug(item.slug.id, versionNumber),
                },
              };
            }
            // Check if it's an Items type (node with children)
            else if (item.items) {
              // Return the { items: ... } structure for the Mutation union, calling recursively
              return {
                items: formatTocItemsRecursive(item, versionNumber),
              };
            }
            console.warn(
              "Skipping unexpected TOC item structure during recursion:",
              item
            );
            return null;
          })
          .filter(Boolean) || [], // Filter out nulls from skipped items
    };
  };

const createTocCopy = async (docsToc: any[], versionNumber: string) => {
    docsToc.forEach(async (doc) => {
        if (!doc?.node) return; // Skip if node is null/undefined

        // Format the supermenuGroup for the mutation
        const formattedSupermenuGroup =
          doc.node.supermenuGroup
            ?.map((group: any) => {
              // group is DocsTableOfContentsSupermenuGroup
              if (!group) return null;
              return {
                title: group.title,
                items:
                  group.items
                    ?.map((item: any) => {
                      // item is DocsTableOfContentsSupermenuGroupItems union
                      if (!item) return null;
                      // Check if it's an Item type - Ensure slug and id exist
                      if (
                        item.slug &&
                        typeof item.slug.id === "string"
                      ) {
                        // Return the { item: ... } structure for the Mutation union
                        return {
                          item: {
                            title: item.title,
                            slug: addSubpathToSlug(item.slug.id, versionNumber),
                          },
                        };
                      }
                      // Check if it's an Items type
                      else if (item.items) {
                        // Return the { items: ... } structure for the Mutation union
                        return {
                          items: formatTocItemsRecursive(item, versionNumber), // Use the recursive helper
                        };
                      }
                      console.warn(
                        "Skipping unexpected top-level TOC item structure:",
                        item
                      );
                      return null;
                    })
                    .filter(Boolean) || [], // Filter out nulls from skipped items
              };
            })
            .filter(Boolean) || []; // Filter out nulls from skipped groups
        await client.queries.addVersionToc({
          relativePath:
            "_versions/" +
            versionNumber +
            "/" +
            doc?.node?._sys.breadcrumbs.join("/") +
            ".json",
        });
        await client.queries.updateVersionDocToc({
          relativePath:
            "_versions/" +
            versionNumber +
            "/" +
            doc?.node?._sys.breadcrumbs.join("/") +
            ".json",
          supermenuGroup: formattedSupermenuGroup,
        });
      });
};

//Creating table of contents copy
export const createToc = async (versionNumber: string) => {
    const tocRaw = await getEntireCollection("docsTableOfContentsConnection");
    const docsToc = tocRaw.filter(
      (edge) => !edge?.node?._sys.breadcrumbs.includes("_versions")
    );
    await createTocCopy(docsToc, versionNumber);
    await client.queries.addVersionToc({
      relativePath:
        "_versions/" + versionNumber + "/_version-index.json",
    });
  };
