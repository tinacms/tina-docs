import { TinaClient } from "@/app/tina-client";
import { fetchTinaData } from "@/src/services/tina/fetch-tina-data";
import getTableOfContents from "@/src/utils/docs/getPageTableOfContents";
import client from "@/tina/__generated__/client";
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
  params: Promise<{ slug: string[] }>;
}) {
  const dynamicParams = await params;
  const slug = dynamicParams?.slug?.join("/");
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  return getSeo(data);
}

async function getData(slug: string) {
  const data = await fetchTinaData(client.queries.docs, slug);
  return data;
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const dynamicParams = await params;
  const slug = dynamicParams?.slug?.join("/");
  const data = await getData(slug);
  const pageTableOfContents = getTableOfContents(data?.data.docs.body);

  return (
    <TinaClient
      Component={Document}
      props={{
        query: data.query,
        variables: data.variables,
        data: data.data,
        pageTableOfContents,
        documentationData: data,
      }}
    />
  );
}
