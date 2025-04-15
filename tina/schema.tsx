import { Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";
import { docsTableOfContentsCollection } from "./collections/docsTableOfContents";
import { versionsCollection } from "./collections/versions";

export const schema = defineSchema({
  collections: [
    docsCollection as Collection,
    docsTableOfContentsCollection as Collection,
    versionsCollection as Collection,
  ],
});
