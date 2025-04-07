import client from "../../tina/__generated__/client";
import { getEntireCollection } from "../generic/fetchEntireCollection";
import { addSubpathToSlug } from "./addSubpath";

// Recursive helper for formatting nested TOC items for the mutation – this one's a little tricky because it uses union types (Templates)
const formatTocItemsRecursive = (tocItemsNode: any, versionNumber: string): any => {
    // Input is a node with { title, items } from the query result (e.g., DocsTableOfContentsSupermenuGroupItemsItems)
    // Output needs to match the corresponding Mutation structure (e.g., DocsTableOfContentsSupermenuGroupItemsItemsMutation)
    //see __generated__/types.ts for the types
    return {
      title: tocItemsNode.title,
      items:
        tocItemsNode.items
          ?.map((item: any) => {
            if (!item) return null;
            if (item.slug && typeof item.slug.id === "string") {
              return {
                item: {
                  title: item.title,
                  slug: addSubpathToSlug(item.slug.id, versionNumber),
                },
              };
            }
            else if (item.items) {
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
          .filter(Boolean) || [],
    };
  };

const createTocCopy = async (docsToc: any[], versionNumber: string) => {
    docsToc.forEach(async (doc) => {
        if (!doc?.node) return;
        const formattedSupermenuGroup =
          doc.node.supermenuGroup
            ?.map((group: any) => {
              if (!group) return null;
              return {
                title: group.title,
                items:
                  group.items
                    ?.map((item: any) => {
                      if (!item) return null;
                      if (
                        item.slug &&
                        typeof item.slug.id === "string"
                      ) {
                        return {
                          item: {
                            title: item.title,
                            slug: addSubpathToSlug(item.slug.id, versionNumber),
                          },
                        };
                      }
                      else if (item.items) {
                        return {
                          items: formatTocItemsRecursive(item, versionNumber),
                        };
                      }
                      console.warn(
                        "Skipping unexpected top-level TOC item structure:",
                        item
                      );
                      return null;
                    })
                    .filter(Boolean) || [],
              };
            })
            .filter(Boolean) || [];
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
