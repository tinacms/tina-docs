import { ImageWithMetadataField } from "../customFields/image-with-metadata";

/**
 * Reusable TinaCMS schema object type for images with metadata.
 * Captures width, height, and alt text alongside the image path.
 *
 * Usage in templates:
 * {
 *   name: "image",
 *   label: "Image",
 *   type: "object",
 *   ...ImageWithMetadataFields
 * }
 */
export const ImageWithMetadataFields = [
  {
    name: "src",
    label: "Image",
    type: "image",
    description: "Select or upload an image",
  },
  {
    name: "width",
    label: "Width",
    type: "number",
    description: "Image width in pixels (auto-captured on upload)",
    ui: {
      component: "hidden",
    },
  },
  {
    name: "height",
    label: "Height",
    type: "number",
    description: "Image height in pixels (auto-captured on upload)",
    ui: {
      component: "hidden",
    },
  },
  {
    name: "alt",
    label: "Alt Text",
    type: "string",
    description: "Describe the image for accessibility",
  },
];

/**
 * Complete object type definition for ImageWithMetadata
 */
export const ImageWithMetadata = {
  type: "object",
  name: "imageMetadata",
  label: "Image with Metadata",
  fields: ImageWithMetadataFields,
  ui: {
    component: ImageWithMetadataField,
  },
};

export default ImageWithMetadata;
