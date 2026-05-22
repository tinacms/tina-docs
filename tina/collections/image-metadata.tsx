export interface ImageMetadata {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
}

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
