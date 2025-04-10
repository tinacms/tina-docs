import { notFound } from "next/navigation";
import client from "../../tina/__generated__/client";
import { getDocsNav } from "../../utils/docs/getDocumentNavigation";
import getTableOfContents from "../../utils/docs/getPageTableOfContents";
import { TinaClient } from "../tina-client";
import DocumentPageClient from "./[...slug]/DocumentPageClient";
import { getExcerpt } from "../../utils/docs/getExcerpt";

export async function generateMetadata() {
  const slug = 'index'
  try {
    const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
    const excerpt = getExcerpt(data.docs.body, 140);

    return {
      title: `${data.docs.seo?.title || data.docs.title} | TinaCMS Docs`,
      description: data.docs.seo?.description || `${excerpt} || TinaCMS Docs`,
      openGraph: {
        title: data.docs.title || 'TinaCMS Docs',
        description: data.docs.seo?.description || `${excerpt} || TinaCMS Docs`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return notFound();
  }
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
    console.error(error);
    return notFound();
  }
}
