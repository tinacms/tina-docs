import client from "@/tina/__generated__/client";
import { getDocsNav } from "@/utils/docs/getDocumentNavigation";
import getTableOfContents from "@/utils/docs/getPageTableOfContents";
import { getSeo } from "@/utils/metadata/getSeo";
import { notFound } from "next/navigation";
import { TinaClient } from "../tina-client";
import DocumentPageClient from "./[...slug]/DocumentPageClient";

export async function generateMetadata() {
  const slug = "index";
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  return getSeo(data);
}

export default async function DocsPage() {
  const defaultSlug = "index";

  try {
    const [documentData, docsToCData] = await Promise.all([
      client.queries.docs({ relativePath: `${defaultSlug}.mdx` }),
      getDocsNav(),
    ]);

    const docData = documentData.data.docs;
    const pageTableOfContents = getTableOfContents(docData.body.children);

    return (
      <TinaClient
        Component={DocumentPageClient}
        props={{
          query: documentData.query,
          variables: documentData.variables,
          data: documentData.data,
          pageTableOfContents,
          documentationData: docData,
          navigationDocsData: docsToCData,
        }}
      />
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return notFound();
  }
}
