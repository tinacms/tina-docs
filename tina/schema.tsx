import { type Collection, defineSchema } from "tinacms";
import DocsCollection from "./collections/docs";
import DocsTableOfContentsCollection from "./collections/docs-table-of-contents";
import GlobalSiteConfiguration from "./collections/site-config";

export const schema = defineSchema({
  collections: [
    DocsCollection as Collection,
    DocsTableOfContentsCollection as Collection,
    GlobalSiteConfiguration as Collection,
  ],
});
