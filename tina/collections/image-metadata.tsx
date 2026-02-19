/**
 * Reusable TinaCMS schema fields for images with metadata.
 * Captures width, height, and alt text alongside the image path.
 *
 * Used by accordion and scroll-showcase templates alongside
 * the ImageWithMetadataField custom component.
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
