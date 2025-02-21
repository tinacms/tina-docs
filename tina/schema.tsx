import { Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";
import { docsTableOfContentsCollection } from "./collections/docsTableOfContents";
import { globalSiteConfiguration } from "./collections/siteConfig";

export const schema = defineSchema({
    collections: [
        globalSiteConfiguration as Collection,
        docsCollection as Collection,
        docsTableOfContentsCollection as Collection,
    ]
})