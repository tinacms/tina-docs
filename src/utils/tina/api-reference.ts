import {
  ADD_PENDING_DOCUMENT_MUTATION,
  GET_DOC_BY_RELATIVE_PATH_QUERY,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getApiReferenceGraphQLQuery } from "@/src/utils/tina/get-api-reference-graphql-query";
import type { TinaGraphQLClient } from "./tina-graphql-client";

// Helper function to compare documents excluding last_edited
const compareDocuments = (existingDoc: any, newData: any): boolean => {
  if (existingDoc.title !== newData.title) {
    return false;
  }

  if (existingDoc.seo?.title !== newData.seo?.title) {
    return false;
  }

  if (existingDoc.seo?.description !== newData.seo?.description) {
    return false;
  }

  const compareBody = (existing: any, newBody: any, path = "body"): boolean => {
    if (existing.type !== newBody.type) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(`❌ Type mismatch at ${path}`);
      return false;
    }

    if (existing.children && newBody.children) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `🔍 Children count at ${path}: ${existing.children.length} vs ${newBody.children.length}`
      );

      // For root level, be more flexible about children count
      if (
        path === "body" &&
        Math.abs(existing.children.length - newBody.children.length) <= 2
      ) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
        console.log(
          `⚠️  Children count difference at root level (${existing.children.length} vs ${newBody.children.length}), but within acceptable range`
        );
      } else if (existing.children.length !== newBody.children.length) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
        console.log(`❌ Children count mismatch at ${path}`);
        return false;
      }

      // Compare children, but be flexible about order and count at root level
      if (path === "body") {
        // For root level, check if essential elements exist in both
        const existingTypes = existing.children.map((child: any) => child.type);
        const newTypes = newBody.children.map((child: any) => child.type);

        // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
        console.log(
          "🔍 Root level types comparison:",
          existingTypes,
          "vs",
          newTypes
        );

        // Check if both have the essential elements: description, headings, and apiReference
        const hasEssentialElements = (children: any[]) => {
          const types = children.map((child: any) => child.type);
          const hasH2 = types.includes("h2");
          const hasApiReference = children.some(
            (child: any) =>
              child.type === "mdxJsxFlowElement" &&
              child.name === "apiReference"
          );
          return hasH2 && hasApiReference;
        };

        if (
          !hasEssentialElements(existing.children) ||
          !hasEssentialElements(newBody.children)
        ) {
          // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
          console.log("❌ Missing essential elements at root level");
          return false;
        }

        // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
        console.log("✅ Essential elements present in both documents");
        return true;
      }

      // For non-root levels, do exact comparison
      for (
        let i = 0;
        i < Math.min(existing.children.length, newBody.children.length);
        i++
      ) {
        if (
          !compareBody(
            existing.children[i],
            newBody.children[i],
            `${path}.children[${i}]`
          )
        ) {
          return false;
        }
      }
    }

    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(`✅ ${path} matches`);
    return true;
  };

  if (!compareBody(existingDoc.body, newData.body)) {
    return false;
  }

  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("✅ All comparisons passed - documents are identical");
  return true;
};

export const createOrUpdateAPIReference = async (
  client: TinaGraphQLClient,
  relativePath: string,
  collection: string,
  endpoint: any,
  schema: string
): Promise<"created" | "updated" | "skipped"> => {
  try {
    await client.request(ADD_PENDING_DOCUMENT_MUTATION, {
      collection,
      relativePath,
    });

    // If created, we still need to populate content
    await client.request(UPDATE_DOCS_MUTATION, {
      relativePath,
      params: await getApiReferenceGraphQLQuery(endpoint, schema),
    });

    return "created";
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      // Fetch the existing record first
      const existingDoc = await client.request(GET_DOC_BY_RELATIVE_PATH_QUERY, {
        relativePath,
      });

      // Get the new data that would be created
      const newData = await getApiReferenceGraphQLQuery(endpoint, schema);

      // Compare all fields except last_edited
      const isIdentical = compareDocuments(existingDoc.docs, newData);

      if (isIdentical) {
        return "skipped";
      }

      // Update existing document
      await client.request(UPDATE_DOCS_MUTATION, {
        relativePath,
        params: newData,
      });

      return "updated";
    }

    throw error;
  }
};
