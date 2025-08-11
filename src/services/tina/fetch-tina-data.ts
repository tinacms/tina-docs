import { notFound } from "next/navigation";

export enum FileType {
  MDX = "mdx",
  JSON = "json",
}

export async function fetchTinaData<T, V>(
  queryFunction: (
    variables?: V,
    options?: unknown
  ) => Promise<{
    data: T;
    variables: V;
    query: string;
  }>,
  filename?: string,
  type: FileType = FileType.MDX
): Promise<{ data: T; variables: V; query: string }> {
  try {
    const variables: V = {
      relativePath: filename ? `${filename}.${type}` : "",
    } as V;

    console.log("Fetching Tina data for:", filename);

    const response = await queryFunction(variables);

    console.log("Tina data fetched successfully for:", filename);

    return response;
  } catch (error) {
    console.error("Error fetching Tina data for:", filename, error);

    // During static generation, we should throw the error instead of calling notFound()
    // This allows the calling code to handle it appropriately
    throw error;
  }
}
