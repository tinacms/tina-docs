import {
  ADD_PENDING_DOCUMENT_MUTATION,
  GET_DOC_BY_RELATIVE_PATH_QUERY,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { compareMarkdown } from "@/src/utils/tina/compare-markdown";
import { getApiReferenceGraphQLQuery } from "@/src/utils/tina/get-api-reference-graphql-query";
import type { TinaGraphQLClient } from "@/src/utils/tina/tina-graphql-client";

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

      if (!existingDoc.docs.auto_generated) {
        return "skipped";
      }

      // Compare all fields except last_edited
      const isIdentical = compareMarkdown(existingDoc.docs, newData);

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
