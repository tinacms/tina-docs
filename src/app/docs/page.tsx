import { TinaClient } from "@/app/tina-client";
import client from "@/tina/__generated__/client";
import getTableOfContents from "@/utils/docs/getPageTableOfContents";
import { getSeo } from "@/utils/metadata/getSeo";
import DocumentPageClient from "./[...slug]/DocumentPageClient";

export async function generateMetadata() {
  const slug = "index";
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  return getSeo(data);
}

export default async function DocsPage() {
  const defaultSlug = "index";

  const documentData = await client.queries.docs({
    relativePath: `${defaultSlug}.mdx`,
  });

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
      }}
    />
  );
}
