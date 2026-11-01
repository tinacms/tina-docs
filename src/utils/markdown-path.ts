/** Maps a docs page path (without base path) to its prebuilt source-Markdown route. */
export const getMarkdownPath = (docsPathname: string): string =>
  `/api/markdown${docsPathname.slice("/docs".length) || "/index"}`;
