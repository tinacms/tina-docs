import { Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";
import { docsTableOfContentsCollection } from "./collections/docsTableOfContents";
import { globalSiteColours } from "./collections/siteConfig";

export const schema = defineSchema({
    collections: [
        globalSiteColours as Collection,
        docsCollection as Collection,
        docsTableOfContentsCollection as Collection,
        
    ]
})