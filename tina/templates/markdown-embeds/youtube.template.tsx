export const YoutubeTemplate = {
  name: "youtube",
  label: "Youtube Video",
  ui: {
    defaultItem: {
      embedSrc: "https://www.youtube.com/embed/CsCQS7HIBv0?si=os9ona92O2VMOl-V",
      caption: "Seth goes over the basics of using TinaCMS",
      minutes: "2",
    },
  },
  fields: [
    {
      type: "string",
      name: "embedSrc",
      label: "Embed URL",
      description:
        "⚠︎ Only YouTube embed URLs work - they look like this https://www.youtube.com/embed/Yoh2c5RUTiY",
    },
    {
      type: "string",
      name: "caption",
      label: "Caption",
      description: "The caption of the video",
    },
    {
      type: "string",
      name: "minutes",
      label: "Minutes",
      description: "The duration of the video in minutes",
    },
  ],
};

export default YoutubeTemplate;
