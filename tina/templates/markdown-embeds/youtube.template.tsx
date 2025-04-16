export const youtubeTemplate = {
  name: "Youtube",
  label: "Youtube Video",
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

export default youtubeTemplate;
