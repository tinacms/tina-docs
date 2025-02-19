import { notFound } from "next/navigation";
import client from "../../tina/__generated__/client";
import { getDocsNav } from "../../utils/docs/getDocumentNavigation";
import getTableOfContents from "../../utils/docs/getPageTableOfContents";
import { TinaClient } from "../tina-client";
import DocumentPageClient from "./[...slug]/DocumentPageClient";

export default async function DocsPage() {
  const defaultSlug = "index"; 

  try {
    const [results, navDocData] = await Promise.all([
      client.queries.docs({ relativePath: `${defaultSlug}.mdx` }),
      getDocsNav(),
    ]);

    const docData = results.data.docs;
    const PageTableOfContents = getTableOfContents(docData.body.children);

    return (
      <TinaClient
        Component={DocumentPageClient}
        props={{
          query: results.query,
          variables: results.variables,
          data: results.data,
          PageTableOfContents,
          DocumentationData: docData,
          NavigationDocsData: navDocData,
        }}
      />
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
