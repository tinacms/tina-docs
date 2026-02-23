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
          image: "/img/rico-replacement.jpg",
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
          type: "image",
          label: "Image",
          name: "image",
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
