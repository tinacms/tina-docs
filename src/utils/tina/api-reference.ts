import {
  ADD_PENDING_DOCUMENT_MUTATION,
  GET_DOC_BY_RELATIVE_PATH_QUERY,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getApiReferenceGraphQLQuery } from "@/src/utils/tina/get-api-reference-graphql-query";
import type { TinaGraphQLClient } from "./tina-graphql-client";

// Helper function to compare documents excluding last_edited
const compareDocuments = (existingDoc: any, newData: any): boolean => {
  // Compare title
  if (existingDoc.title !== newData.title) {
    return false;
  }

  // Compare SEO
  if (existingDoc.seo?.title !== newData.seo?.title) {
    return false;
  }
  if (existingDoc.seo?.description !== newData.seo?.description) {
    return false;
  }

  // Compare body structure (deep comparison)
  const compareBody = (existing: any, newBody: any): boolean => {
    if (existing.type !== newBody.type) return false;

    if (existing.children && newBody.children) {
      if (existing.children.length !== newBody.children.length) return false;

      for (let i = 0; i < existing.children.length; i++) {
        if (!compareBody(existing.children[i], newBody.children[i]))
          return false;
      }
    }

    if (existing.text !== newBody.text) return false;
    if (existing.bold !== newBody.bold) return false;
    if (existing.code !== newBody.code) return false;
    if (existing.name !== newBody.name) return false;

    // Compare props
    if (existing.props && newBody.props) {
      if (existing.props.schemaFile !== newBody.props.schemaFile) return false;
    }

    return true;
  };

  if (!compareBody(existingDoc.body, newData.body)) {
    return false;
  }

  return true;
};

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
      // Fetch the existing record first
      const existingDoc = await client.request(GET_DOC_BY_RELATIVE_PATH_QUERY, {
        relativePath,
      });

      // Get the new data that would be created
      const newData = await getApiReferenceGraphQLQuery(endpoint, schema);

      // Compare all fields except last_edited
      const isIdentical = compareDocuments(existingDoc.docs, newData);

      if (isIdentical) {
        return "updated";
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
