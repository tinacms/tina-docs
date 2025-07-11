const AccordionItemFields = [
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
];

export const AccordionTemplate = {
  name: "accordion",
  label: "Accordion",
  ui: {
    defaultItem: {
      heading: "Click to expand",
      //TODO: Need to configure this to be a rich text field
      docText: {
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
      image: "/img/rico-replacement.jpg",
      fullWidth: false,
    },
  },
  fields: [
    ...AccordionItemFields,
    {
      name: "fullWidth",
      label: "Full Width",
      type: "boolean",
    },
  ],
};

export default AccordionTemplate;

export const AccordionBlockTemplate = {
  name: "accordionBlock",
  label: "Accordion Block",
  fields: [
    {
      name: "fullWidth",
      label: "Full Width",
      type: "boolean",
    },
    {
      name: "accordionItems",
      label: "Accordion Items",
      type: "object",
      list: true,
      fields: AccordionItemFields,
      ui: {
        itemProps: (item) => {
          return {
            label: item.heading ?? "Accordion Item",
          };
        },
        defaultItem: {
          heading: "Click to expand",
          docText: {
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
          image: "/img/rico-replacement.jpg",
        },
      },
    },
  ],
};
