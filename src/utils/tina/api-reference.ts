import {
  ADD_PENDING_DOCUMENT_MUTATION,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getApiReferenceGraphQLQuery } from "@/src/utils/tina/get-api-reference-graphql-query";
import type { TinaGraphQLClient } from "./tina-graphql-client";

export const createOrUpdateAPIReference = async (
  client: TinaGraphQLClient,
  relativePath: string,
  collection: string,
  endpoint: any,
  schema: string
): Promise<"created" | "updated"> => {
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
      // Update existing document
      await client.request(UPDATE_DOCS_MUTATION, {
        relativePath,
        params: await getApiReferenceGraphQLQuery(endpoint, schema),
      });

      return "updated";
    }

    throw error;
  }
};
