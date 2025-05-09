/**
 * Utilities for generating content excerpts
 */

interface TextNode {
  type: string;
  text: string;
}

interface LinkNode {
  type: string;
  children: TextNode[];
}

interface ParagraphNode {
  type: string;
  children: (TextNode | LinkNode)[];
}

interface ContentBody {
  children: any[];
}

/**
 * Extracts an excerpt from markdown content
 * Creates a text-only summary from the first paragraphs up to the specified length
 *
 * @param body - The markdown body content structure
 * @param excerptLength - Maximum length of the excerpt in characters
 * @returns A plain text excerpt of the content
 */
export const formatExcerpt = (
  body: ContentBody,
  excerptLength: number
): string => {
  return body.children
    .filter((c) => c.type === "p")
    .reduce((excerpt, child) => {
      // Combine all of child's text and link nodes into a single string
      const paragraphText = child.children
        .filter((c) => c.type === "text" || c.type === "a")
        .reduce((text, child) => {
          if (child.type === "text") {
            return text + (text ? " " : "") + child.text;
          }
          if (child.type === "a") {
            return (
              text +
              (text ? " " : "") +
              (child as LinkNode).children.map((c) => c.text).join(" ")
            );
          }
          return text;
        }, "");

      // Add paragraph to excerpt with space separator
      const updatedExcerpt = excerpt
        ? `${excerpt} ${paragraphText}`
        : paragraphText;

      // Truncate if the combined text is too long
      if (updatedExcerpt.length > excerptLength) {
        return `${updatedExcerpt.substring(0, excerptLength)}...`;
      }

      return updatedExcerpt;
    }, "");
};
