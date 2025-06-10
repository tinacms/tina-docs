export const CardGridTemplate = {
  name: "cardGrid",
  label: "Card Grid",
  ui: {
    defaultItem: {
      cards: [
        {
          title: "Card Title",
          description: "Card Description",
          link: "https://www.google.com",
          linkText: "Search now",
        },
      ],
    },
  },
  fields: [
    {
      name: "cards",
      label: "Cards",
      type: "object",
      list: true,
      ui: {
        defaultItem: () => {
          return {
            title: "Card Title",
            description: "Card Description",
            link: "https://www.google.com",
            linkText: "Search now",
          };
        },
        itemProps: (item) => {
          return {
            label: item.title || "Untitled",
          };
        },
      },
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: {
            component: "textarea",
          },
        },
        {
          name: "link",
          label: "Link",
          type: "string",
        },
        {
          name: "linkText",
          label: "Button Text",
          type: "string",
        },
      ],
    },
  ],
};

export default CardGridTemplate;
