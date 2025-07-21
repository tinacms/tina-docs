import {
  ADD_PENDING_DOCUMENT_MUTATION,
  GET_DOC_BY_RELATIVE_PATH_QUERY,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getApiReferenceGraphQLQuery } from "@/src/utils/tina/get-api-reference-graphql-query";
import type { TinaGraphQLClient } from "./tina-graphql-client";

// Helper function to compare documents excluding last_edited
const compareDocuments = (existingDoc: any, newData: any): boolean => {
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("🔍 Starting document comparison...");

  // Compare title
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(
    `📝 Title comparison: "${existingDoc.title}" vs "${newData.title}"`
  );
  if (existingDoc.title !== newData.title) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ Title mismatch");
    return false;
  }
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("✅ Title matches");

  // Compare SEO
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(
    `🔍 SEO title comparison: "${existingDoc.seo?.title}" vs "${newData.seo?.title}"`
  );
  if (existingDoc.seo?.title !== newData.seo?.title) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ SEO title mismatch");
    return false;
  }
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("✅ SEO title matches");

  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(
    `🔍 SEO description comparison: "${existingDoc.seo?.description}" vs "${newData.seo?.description}"`
  );
  if (existingDoc.seo?.description !== newData.seo?.description) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ SEO description mismatch");
    return false;
  }
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("✅ SEO description matches");

  // Compare body structure (deep comparison)
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("🔍 Starting body comparison...");

  // Log the structure of both documents for debugging
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(
    "📋 Existing document structure:",
    JSON.stringify(existingDoc.body, null, 2)
  );
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(
    "📋 New document structure:",
    JSON.stringify(newData.body, null, 2)
  );

  const compareBody = (existing: any, newBody: any, path = "body"): boolean => {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(
      `🔍 Comparing at ${path}: type "${existing.type}" vs "${newBody.type}"`
    );

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

    if (existing.text !== newBody.text) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `❌ Text mismatch at ${path}: "${existing.text}" vs "${newBody.text}"`
      );
      return false;
    }

    if (existing.bold !== newBody.bold) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `❌ Bold mismatch at ${path}: ${existing.bold} vs ${newBody.bold}`
      );
      return false;
    }

    if (existing.code !== newBody.code) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `❌ Code mismatch at ${path}: ${existing.code} vs ${newBody.code}`
      );
      return false;
    }

    if (existing.name !== newBody.name) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `❌ Name mismatch at ${path}: "${existing.name}" vs "${newBody.name}"`
      );
      return false;
    }

    // Compare props
    if (existing.props && newBody.props) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `🔍 Props comparison at ${path}:`,
        existing.props,
        "vs",
        newBody.props
      );

      if (existing.props.schemaFile !== newBody.props.schemaFile) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
        console.log(
          `❌ SchemaFile mismatch at ${path}: "${existing.props.schemaFile}" vs "${newBody.props.schemaFile}"`
        );
        return false;
      }
    }

    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(`✅ ${path} matches`);
    return true;
  };

  if (!compareBody(existingDoc.body, newData.body)) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ Body content mismatch");
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
