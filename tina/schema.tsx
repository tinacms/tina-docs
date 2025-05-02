import { type Collection, defineSchema } from "tinacms";
import docsCollection from "./collections/docs";
import docsNavigationBarCollection from "./collections/navigation-bar";
import { Settings } from "./collections/settings";

export const schema = defineSchema({
  collections: [
    docsCollection as Collection,
    docsNavigationBarCollection as Collection,
    Settings as Collection,
  ],
});
