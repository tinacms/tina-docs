export const AccordionTemplate = {
  name: "accordion",
  label: "Accordion",
  ui: {
    defaultItem: {
      heading: "Click to expand",
      //TODO: Need to configure this to be a rich text field
      docText: "",
      image: "/img/rico-replacement.jpg",
      fullWidth: false,
    },
  },
  fields: [
    {
      name: "heading",
      label: "Heading",
      type: "string",
      description:
        "The heading text that will be displayed in the collapsed state",
    },
    {
      name: "docText",
      label: "Body Text",
      isBody: true,
      type: "rich-text",
    },
    {
      name: "image",
      label: "image",
      type: "image",
    },
    {
      name: "fullWidth",
      label: "Full Width",
      type: "boolean",
    },
  ],
};

export default AccordionTemplate;
