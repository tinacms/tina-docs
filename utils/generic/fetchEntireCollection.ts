import { notFound } from "next/navigation";
import client from "../../tina/__generated__/client";

export const getEntireCollection = async (queryName: string) => {
    let hasNextPage = true;
    let allArray: any[] = [];
    let after: string | null = null;

    while (hasNextPage) {
      try {
        const data = await client.queries[queryName]({ after });

        const edges = data?.data?.[queryName]?.edges || [];
        const pageInfo = data?.data?.[queryName]?.pageInfo || {
          hasNextPage: false,
          endCursor: null,
        };

        allArray = allArray.concat(edges);

        hasNextPage = pageInfo.hasNextPage;
        after = pageInfo.endCursor;
      } catch (error) {
        console.error("Error during static params generation:", error);
        notFound();
      }
    }
    return allArray;
  };