import { type Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";
import { docsNavigationBarCollection } from "./collections/navigation-bar";

export const schema = defineSchema({
  collections: [
    docsCollection as Collection,
    docsNavigationBarCollection as Collection,
  ],
});
