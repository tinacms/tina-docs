import { type Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";
import { docsTableOfContentsCollection } from "./collections/docs-table-of-contents";

export const schema = defineSchema({
  collections: [
    docsCollection as Collection,
    docsTableOfContentsCollection as Collection,
  ],
});
