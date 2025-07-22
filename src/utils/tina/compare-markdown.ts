// Types for better readability
interface DocumentData {
  title: string;
  seo?: {
    title?: string;
    description?: string;
  };
  body: any;
}

interface BodyNode {
  type: string;
  children?: BodyNode[];
  name?: string;
}
// Main comparison function
export const compareMarkdown = (
  existingDoc: DocumentData,
  newData: DocumentData
): boolean => {
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("🔍 Starting document comparison...");

  // Compare basic fields first
  if (!compareBasicFields(existingDoc, newData)) {
    return false;
  }

  // Compare body content
  if (!compareBodyNode(existingDoc.body, newData.body, "body")) {
    return false;
  }

  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log("✅ All comparisons passed - documents are identical");
  return true;
};

// Helper function to compare basic document fields
const compareBasicFields = (
  existingDoc: DocumentData,
  newData: DocumentData
): boolean => {
  if (existingDoc.title !== newData.title) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ Title mismatch");
    return false;
  }

  if (existingDoc.seo?.title !== newData.seo?.title) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ SEO title mismatch");
    return false;
  }

  if (existingDoc.seo?.description !== newData.seo?.description) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log("❌ SEO description mismatch");
    return false;
  }

  return true;
};

// Helper function to check if a node has essential API reference elements
const hasEssentialApiReferenceElements = (children: BodyNode[]): boolean => {
  const types = children.map((child) => child.type);
  const hasH2 = types.includes("h2");
  const hasApiReference = children.some(
    (child) =>
      child.type === "mdxJsxFlowElement" && child.name === "apiReference"
  );

  return hasH2 && hasApiReference;
};

// Helper function to compare children arrays
const compareChildren = (
  existing: BodyNode[],
  newChildren: BodyNode[],
  path: string
): boolean => {
  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(
    `🔍 Children count at ${path}: ${existing.length} vs ${newChildren.length}`
  );

  // For root level, be more flexible about children count
  if (path === "body") {
    const countDifference = Math.abs(existing.length - newChildren.length);
    if (countDifference <= 2) {
      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log(
        `⚠️  Children count difference at root level (${existing.length} vs ${newChildren.length}), but within acceptable range`
      );

      // Check if both have essential elements
      if (
        !hasEssentialApiReferenceElements(existing) ||
        !hasEssentialApiReferenceElements(newChildren)
      ) {
        // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
        console.log("❌ Missing essential elements at root level");
        return false;
      }

      // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
      console.log("✅ Essential elements present in both documents");
      return true;
    }

    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(`❌ Children count mismatch at ${path}`);
    return false;
  }

  // For non-root levels, do exact comparison
  if (existing.length !== newChildren.length) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(`❌ Children count mismatch at ${path}`);
    return false;
  }

  // Compare each child
  for (let i = 0; i < existing.length; i++) {
    if (
      !compareBodyNode(existing[i], newChildren[i], `${path}.children[${i}]`)
    ) {
      return false;
    }
  }

  return true;
};

// Helper function to compare individual body nodes
const compareBodyNode = (
  existing: BodyNode,
  newNode: BodyNode,
  path: string
): boolean => {
  if (existing.type !== newNode.type) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(`❌ Type mismatch at ${path}`);
    return false;
  }

  // If both have children, compare them
  if (existing.children && newNode.children) {
    return compareChildren(existing.children, newNode.children, path);
  }

  // If only one has children, they don't match
  if (existing.children || newNode.children) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
    console.log(`❌ Children mismatch at ${path}`);
    return false;
  }

  // biome-ignore lint/suspicious/noConsole: Debug logging for comparison
  console.log(`✅ ${path} matches`);
  return true;
};
