import { TinaClient } from "@/app/tina-client";
import { fetchTinaData } from "@/src/services/tina/fetch-tina-data";
import client from "@/tina/__generated__/client";
import { getSeo } from "@/utils/metadata/getSeo";
import Document from "./[...slug]";

export async function generateMetadata() {
  const slug = "index";
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  return getSeo(data);
}

async function getData() {
  const defaultSlug = "index";
  const data = await fetchTinaData(client.queries.docs, defaultSlug);
  return data;
}

export default async function DocsPage() {
  const data = await getData();

  return (
    <TinaClient
      Component={Document}
      props={{
        query: data.query,
        variables: data.variables,
        data: data.data,
      }}
    />
  );
}
