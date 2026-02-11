import {
  ImageWithMetadataFields,
} from "../../collections/image-metadata";
import { ImageWithMetadataField } from "../../customFields/image-with-metadata";

export const ScrollShowcaseTemplate = {
  label: "Scroll Showcase",
  name: "scrollShowcase",
  fields: [
    {
      type: "object",
      label: "Showcase Items",
      name: "showcaseItems",
      list: true,
      ui: {
        defaultItem: {
          title: "Title",
          image: {
            src: "/img/rico-replacement.jpg",
            alt: "",
          },
          content: {
            type: "root",
            children: [
              {
                type: "p",
                children: [
                  {
                    type: "text",
                    text: "Default Text. Edit me!",
                  },
                ],
              },
            ],
          },
          useAsSubsection: false,
        },
        itemProps: (item) => {
          return {
            label: item.title,
          };
        },
      },
      fields: [
        {
          name: "image",
          label: "Image",
          type: "object",
          fields: ImageWithMetadataFields,
          ui: {
            component: ImageWithMetadataField,
          },
        },
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "boolean",
          label: "Use as Subsection",
          name: "useAsSubsection",
        },
        {
          type: "rich-text",
          label: "Content",
          name: "content",
        },
      ],
    },
  ],
};

export default ScrollShowcaseTemplate;
