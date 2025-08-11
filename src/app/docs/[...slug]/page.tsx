import { TinaClient } from "@/app/tina-client";
import settings from "@/content/siteConfig.json";
import { fetchTinaData } from "@/services/tina/fetch-tina-data";
import client from "@/tina/__generated__/client";
import { getTableOfContents } from "@/utils/docs";
import { getSeo } from "@/utils/metadata/getSeo";
import Document from ".";

export const dynamic = "force-static";

const siteUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : settings.siteUrl;

export async function generateStaticParams() {
  try {
    console.log("Starting generateStaticParams...");

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
      allPagesListData.data.docsConnection.edges?.map((page) => {
        const filename = page?.node?._sys.path;
        console.log(
          "🚀 ~ generateStaticParams ~ page?.node?._sys:",
          page?.node?._sys
        );
        // Remove .mdx extension and split by / to create slug array
        const slugWithoutExtension = filename?.replace(/\.mdx$/, "");
        const slugArray = slugWithoutExtension?.split("/") || [];

        console.log("Processing page:", filename, "-> slug:", slugArray);

        return {
          slug: slugArray,
        };
      }) || [];

    console.log("Generated static params:", pages.length, "pages");
    return pages;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
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
  try {
    console.log("Fetching data for slug:", slug);
    const data = await fetchTinaData(client.queries.docs, slug);
    console.log("Data fetched successfully for slug:", slug);
    return data;
  } catch (error) {
    console.error("Error fetching data for slug:", slug, error);
    throw error;
  }
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  try {
    const dynamicParams = await params;
    const slug = dynamicParams?.slug?.join("/");

    console.log("Rendering page for slug:", slug);

    const data = await getData(slug);

    if (!data?.data?.docs) {
      console.error("No docs data found for slug:", slug);
      // Instead of throwing an error, return a 404 page
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-gray-600">
              The page you're looking for doesn't exist.
            </p>
          </div>
        </div>
      );
    }

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
  } catch (error) {
    console.error("Error rendering page:", error);
    // Return a fallback UI instead of throwing
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600">
            We're having trouble loading this page.
          </p>
        </div>
      </div>
    );
  }
}
