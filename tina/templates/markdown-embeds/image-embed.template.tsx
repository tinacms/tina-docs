import { ImageWithMetadataFields } from "../../collections/image-metadata";
import { ImageWithMetadataField } from "../../customFields/image-with-metadata";

export const ImageEmbedTemplate = {
  name: "imageEmbed",
  label: "Image",
  ui: {
    defaultItem: {
      image: {
        src: "/img/rico-replacement.jpg",
        alt: "",
      },
      caption: "",
      disableLightbox: false,
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
      name: "caption",
      label: "Caption",
      type: "string",
      description: "Displayed as 'Figure: {caption}' below the image",
    },
    {
      name: "disableLightbox",
      label: "Disable Lightbox",
      type: "boolean",
      description: "Disable the click-to-expand lightbox overlay",
    },
  ],
};

export default ImageEmbedTemplate;
