import client from "../../tina/__generated__/client";
import { getEntireCollection } from "../generic/fetchEntireCollection";

const createDocsCopy = async (docs: any[], versionNumber: string) => {
  for (const doc of docs) {
    const docPath =
      "_versions/" +
      versionNumber +
      "/" +
      doc?.node?._sys.breadcrumbs.join("/") +
      ".mdx";
      try {
        await client.queries.addVersionDocFiles({
          relativePath: docPath,
        });
        await client.queries.updateVersionDoc({
          relativePath: docPath,
          body: doc?.node?.body,
          title: doc?.node?.title,
          last_edited: doc?.node?.last_edited,
          tocIsHidden: doc?.node?.tocIsHidden,
          next: doc?.node?.next?.id,
          previous: doc?.node?.previous?.id,
        });
      } catch (err) {
        console.log("err", err);
      }
  }
};

//Creating document copy
export const createDocs = async (versionNumber: string) => {
    const docsRaw = await getEntireCollection("docsConnection");
    const docs = docsRaw.filter(
      (edge) => !edge?.node?._sys.breadcrumbs.includes("_versions")
    );
    await createDocsCopy(docs, versionNumber);
    await client.queries.addVersionDocFiles({
      relativePath:
        "_versions/" + versionNumber + "/_version-index.mdx",
    });
  };
