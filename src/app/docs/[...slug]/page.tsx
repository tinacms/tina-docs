import { TinaClient } from "@/app/tina-client";
import { fetchTinaData } from "@/src/services/tina/fetch-tina-data";
import client from "@/tina/__generated__/client";
import getTableOfContents from "@/utils/docs/getPageTableOfContents";
import { getSeo } from "@/utils/metadata/getSeo";
import fg from "fast-glob";
import Document from ".";

export async function generateStaticParams() {
  const contentDir = "./content/docs/";
  const files = await fg(`${contentDir}**/*.mdx`);
  return files
    .filter((file) => !file.endsWith("index.mdx"))
    .map((file) => {
      const path = file.substring(contentDir.length, file.length - 4); // Remove "./content/docs/" and ".mdx"
      return { slug: path.split("/") };
    });
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

async function getData(slug: string) {
  const documentData = await fetchTinaData(client.queries.docs, slug);
  const pageTableOfContents = getTableOfContents(documentData?.data.docs.body);

  return {
    documentData,
    pageTableOfContents,
  };
}

export default async function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const slug = params.slug.join("/");
  const { documentData, pageTableOfContents } = await getData(slug);

  return (
    <TinaClient
      Component={Document}
      props={{
        query: documentData.query,
        variables: documentData.variables,
        data: documentData.data,
        pageTableOfContents,
        documentationData: documentData,
      }}
    />
  );
}
