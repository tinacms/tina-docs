import { notFound } from "next/navigation";
import client from "../../tina/__generated__/client";
import { getDocsNav } from "../../utils/navigation/getDocumentNavigation";
import getTableOfContents from "../../utils/navigation/getPageTableOfContents";
import { TinaClient } from "../tina-client";
import DocumentPageClient from "./[...slug]/DocumentPageClient";
import { getExcerpt } from "../../utils/seo/getExcerpt";
import { getEntireCollection } from "../../utils/generic/fetchEntireCollection";

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
    const [documentData, docsToCData, versionData] = await Promise.all([
      client.queries.docs({ relativePath: `${defaultSlug}.mdx` }),
      getDocsNav({version: null}),
      getEntireCollection('versionsConnection'),
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
          versionData: versionData,
        }}
      />
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
