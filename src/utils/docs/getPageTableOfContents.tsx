"use client";

type MarkdownNode = {
  type: string;
  children?: MarkdownNode[];
  text?: string;
};

type MarkdownContent = {
  children?: MarkdownNode[];
};

export default function getTableOfContents(
  markdown: MarkdownContent | MarkdownNode[],
): { type: string; text: string }[] {
  const toc: { type: string; text: string }[] = [];

  // If markdown is an object with a "children" property, use it;
  // otherwise, assume markdown itself is an array.
  const nodes = Array.isArray(markdown)
    ? markdown
    : Array.isArray(markdown.children)
      ? markdown.children
      : [];

  nodes.forEach((item) => {
    if (
      (item.type === "h2" || item.type === "h3") &&
      Array.isArray(item.children)
    ) {
      const headerText = item.children
        .map((child) => child.text || "")
        .join("");
      toc.push({ type: item.type, text: headerText });
    }
  });

  return toc;
}
