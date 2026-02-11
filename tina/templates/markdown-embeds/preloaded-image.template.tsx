import {
  ImageWithMetadataFields,
} from "../../collections/image-metadata";
import { ImageWithMetadataField } from "../../customFields/image-with-metadata";

export const PreloadedImageTemplate = {
  label: "Preloaded Image",
  name: "preloadedImage",
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
      description: "Optional caption to display below the image",
    },
  ],
  ui: {
    defaultItem: {
      image: {
        src: "/img/rico-replacement.jpg",
        alt: "",
      },
      caption: "",
    },
  },
};

export default PreloadedImageTemplate;
