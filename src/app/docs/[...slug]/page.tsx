import { TinaClient } from "@/app/tina-client";
import settings from "@/content/siteConfig.json";
import { fetchTinaData } from "@/services/tina/fetch-tina-data";
import client from "@/tina/__generated__/client";
import { getTableOfContents } from "@/utils/docs";
import { getSeo } from "@/utils/metadata/getSeo";
import Document from ".";

const siteUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : settings.siteUrl;

export async function generateStaticParams() {
  let pageListData = await client.queries.docsConnection();
  const allPagesListData = pageListData;

  while (pageListData.data.docsConnection.pageInfo.hasNextPage) {
    const lastCursor = pageListData.data.docsConnection.pageInfo.endCursor;
    pageListData = await client.queries.docsConnection({
      after: lastCursor,
    });

    allPagesListData.data.docsConnection.edges?.push(
      ...(pageListData.data.docsConnection.edges || [])
    );
  }

  const pages =
    allPagesListData.data.docsConnection.edges?.map((page) => ({
      filename: page?.node?._sys.filename,
    })) || [];

  return pages;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const dynamicParams = await params;
  const slug = dynamicParams?.slug?.join("/");
  const { data } = await client.queries.docs({ relativePath: `${slug}.mdx` });

  if (!data.docs.seo) {
    data.docs.seo = {
      __typename: "DocsSeo",
      canonicalUrl: `${siteUrl}/docs/${slug}`,
    };
  } else if (!data.docs.seo?.canonicalUrl) {
    data.docs.seo.canonicalUrl = `${siteUrl}/docs/${slug}`;
  }

  return getSeo(data.docs.seo, {
    pageTitle: data.docs.title,
    body: data.docs.body,
  });
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
        forceExperimental: data.variables.relativePath,
      }}
    />
  );
}
