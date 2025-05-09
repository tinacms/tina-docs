/**
 * Utilities for generating and managing table of contents
 */

interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  text?: string;
}

interface TocItem {
  type: string;
  text: string;
}

/**
 * Extracts header elements from markdown content to create a table of contents
 * Only includes h2 and h3 headings
 *
 * @param markdown - The markdown content structure
 * @returns An array of heading objects with type and text properties
 */
export function getTableOfContents(
  markdown: MarkdownNode | MarkdownNode[]
): TocItem[] {
  const toc: TocItem[] = [];

  // If markdown is an object with a "children" property, use it;
  // otherwise, assume markdown itself is an array
  const nodes = Array.isArray(markdown)
    ? markdown
    : Array.isArray(markdown.children)
      ? markdown.children
      : [];

  for (const item of nodes) {
    if (
      (item.type === "h2" || item.type === "h3") &&
      Array.isArray(item.children)
    ) {
      const headerText = item.children
        .map((child) => child.text || "")
        .join("");
      toc.push({ type: item.type, text: headerText });
    }
  }

  return toc;
}
