import { TinaClient } from "@/app/tina-client";
import settings from "@/content/siteConfig.json";
import { fetchTinaData } from "@/services/tina/fetch-tina-data";
import client from "@/tina/__generated__/client";
import { getTableOfContents } from "@/utils/docs";
import { getSeo } from "@/utils/metadata/getSeo";
import Document from "./[...slug]";

const siteUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : settings.siteUrl;

export async function generateMetadata() {
  const slug = "index";
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });
  if (!data.docs.seo) {
    data.docs.seo = {
      __typename: "DocsSeo",
      canonicalUrl: `${siteUrl}/tinadocs/docs`,
    };
  } else if (!data.docs.seo?.canonicalUrl) {
    data.docs.seo.canonicalUrl = `${siteUrl}/tinadocs/docs`;
  }

  return getSeo(data.docs.seo, {
    pageTitle: data.docs.title,
    body: data.docs.body,
  });
}

async function getData() {
  const defaultSlug = "index";
  const data = await fetchTinaData(client.queries.docs, defaultSlug);
  return data;
}

export default async function DocsPage() {
  const data = await getData();
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
        forceExperimental: data.variables.relativePath,
      }}
    />
  );
}
