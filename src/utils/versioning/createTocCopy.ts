import client from "@/tina/__generated__/client";
import { getEntireCollection } from "@/utils/fetchEntireCollection";
import { addSubpathToSlug } from "@/utils/versioning/addSubpath";

//Creating table of contents copy
export const createToc = async (versionNumber: string) => {
  const tocRaw = await getEntireCollection("docsTableOfContentsConnection");
  const docsToc = tocRaw.filter(
    (edge) => !edge?.node?._sys.breadcrumbs.includes("_versions")
  );
  await createTocCopy(docsToc, versionNumber);
  await client.queries.addVersionToc({
    relativePath: "_versions/" + versionNumber + "/_version-index.json",
  });
};
