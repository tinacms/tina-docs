import { TinaClient } from "@/app/tina-client";
import { fetchTinaData } from "@/src/services/tina/fetch-tina-data";
import client from "@/tina/__generated__/client";
import getTableOfContents from "@/utils/docs/getPageTableOfContents";
import { getSeo } from "@/utils/metadata/getSeo";
import Document from "./[...slug]";

export async function generateMetadata() {
  const slug = "index";
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  return getSeo(data);
}

async function getData() {
  const defaultSlug = "index";
  const documentData = await fetchTinaData(client.queries.docs, defaultSlug);

  const pageTableOfContents = getTableOfContents(
    documentData.data.docs.body.children
  );

  return {
    documentData,
    pageTableOfContents,
    docData: documentData.data.docs,
  };
}

export default async function DocsPage() {
  const { documentData, pageTableOfContents, docData } = await getData();

  return (
    <TinaClient
      Component={Document}
      props={{
        query: documentData.query,
        variables: documentData.variables,
        data: documentData.data,
        pageTableOfContents,
        documentationData: docData,
      }}
    />
  );
}
