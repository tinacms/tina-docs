import { Collection, defineSchema } from "tinacms";
import { docsCollection } from "./collections/docs";

export const schema = defineSchema({
    collections: [
        docsCollection as Collection
    ]
})