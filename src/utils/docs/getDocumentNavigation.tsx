import data from "@/content/siteConfig.json";
import client from "@/tina/__generated__/client";

export async function getDocsNav(preview?: boolean) {
  const docsToCData = await client.queries.navigationBar({
    relativePath: "DocsNavigationBar.json",
  });

  return formatTableofContentsData(docsToCData.data, preview);
}

const stripReferenceDownToSlug = (tableOfContentsSubset: any) => {
  tableOfContentsSubset.forEach((obj, index, array) => {
    if (obj._template) {
      if (obj._template === "items") {
        array[index].items = stripReferenceDownToSlug(obj.items);
      } else {
        //Handles the docs homepage case, as the only docs page with a unique (i.e. no) slug, otherwise reformat
        array[index].slug =
          array[index].slug === `content${data.docsHomepage}.mdx`
            ? "/docs"
            : obj.slug.replace(/^content\/|\.mdx$/g, "/");
      }
    }
  });
  return tableOfContentsSubset;
};

export const formatTableofContentsData = (
  tableOfContentsData: any,
  preview?: boolean
) => {
  // NOTE: The original code expected a nested `data` property and a `_values` field.
  // Based on the logged structure, docsTableOfContents is already at the root.
  // Therefore, we access supermenuGroup directly.
  const exposedTOCData = tableOfContentsData.navigationBar.supermenuGroup;

  exposedTOCData.forEach((obj: any, index: number, array: any[]) => {
    array[index].items = stripReferenceDownToSlug(obj.items);
  });

  return {
    data: {
      title: tableOfContentsData.navigationBar.title,
      items: exposedTOCData,
    },
    sha: "",
    fileRelativePath: "content/toc-doc.json",
    preview: !!preview,
  };
};
