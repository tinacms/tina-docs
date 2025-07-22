import { type Collection, defineSchema } from "tinacms";
import API_Schema_Collection from "./collections/API-schema";
import docsCollection from "./collections/docs";
import docsNavigationBarCollection from "./collections/navigation-bar";
import { Settings } from "./collections/settings";

export const schema = defineSchema({
  collections: [
    docsCollection as Collection,
    docsNavigationBarCollection as Collection,
    //TODO: Investigate why casting as unknown works
    API_Schema_Collection as unknown as Collection,
    Settings as unknown as Collection,
  ],
});
