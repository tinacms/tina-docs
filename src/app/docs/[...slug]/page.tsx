import client from "@/tina/__generated__/client";
import { getDocsNav } from "@/utils/docs/getDocumentNavigation";
import getTableOfContents from "@/utils/docs/getPageTableOfContents";
import { getSeo } from "@/utils/metadata/getSeo";
import fg from "fast-glob";
import { notFound } from "next/navigation";
import DocumentPageClient from "./DocumentPageClient";

export async function generateStaticParams() {
  try {
    const contentDir = "./content/docs/";
    const files = await fg(`${contentDir}**/*.mdx`);
    return files
      .filter((file) => !file.endsWith("index.mdx"))
      .map((file) => {
        const path = file.substring(contentDir.length, file.length - 4); // Remove "./content/docs/" and ".mdx"
        return { slug: path.split("/") };
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}) {
  const slug = params.slug?.join("/");
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  return getSeo(data);
}

export default async function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const slug = params.slug.join("/");

  try {
    const [documentData, docsToCData] = await Promise.all([
      client.queries.docs({ relativePath: `${slug}.mdx` }),
      getDocsNav(),
    ]);

    const pageTableOfContents = getTableOfContents(
      documentData?.data.docs.body,
    );

    const props = {
      query: documentData.query,
      variables: documentData.variables,
      data: documentData.data,
      pageTableOfContents,
      documentationData: documentData,
      navigationDocsData: docsToCData,
    };

    return (
      <div>
        {" "}
        <DocumentPageClient props={props} />
      </div>
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return notFound();
  }
}
