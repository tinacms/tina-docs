export const AccordionTemplate = {
  name: "accordion",
  label: "Accordion",
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
      label: "docText",
      isBody: true,
      type: "rich-text",
    },
    {
      name: "image",
      label: "image",
      type: "image",
    },
  ],
};

export default AccordionTemplate;
