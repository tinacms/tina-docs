import { type Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";
import { docsNavigationBarCollection } from "./collections/docs-table-of-contents";

export const schema = defineSchema({
  collections: [
    docsCollection as Collection,
    docsNavigationBarCollection as Collection,
  ],
});
