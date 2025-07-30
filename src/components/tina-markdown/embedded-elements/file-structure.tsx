import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { tinaField } from "tinacms/dist/react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
}

interface FileStructureProps {
  fileStructure: FileItem[];
  caption?: string;
}

interface TreeNode extends FileItem {
  children: TreeNode[];
  level: number;
}

const SPACING = {
  LEVEL_INDENT: 20,
  BASE_PADDING: 8,
} as const;

const buildTree = (items: FileItem[]): TreeNode[] => {
  const itemMap = new Map<string, TreeNode>();
  const rootItems: TreeNode[] = [];

  for (const item of items) {
    itemMap.set(item.id, { ...item, children: [], level: 0 });
  }

  for (const item of items) {
    const node = itemMap.get(item.id);
    if (!node) continue;

    if (item.parentId === null) {
      rootItems.push(node);
    } else {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      }
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) =>
      a.type !== b.type
        ? a.type === "folder"
          ? -1
          : 1
        : a.name.localeCompare(b.name)
    );
    for (const node of nodes) sortNodes(node.children);
  };

  sortNodes(rootItems);
  return rootItems;
};

interface FileTreeItemProps {
  node: TreeNode;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
}

const FileTreeItem = ({
  node,
  expandedFolders,
  toggleFolder,
}: FileTreeItemProps) => {
  const isExpanded = expandedFolders.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={[
          "flex items-center gap-2 py-1 hover:bg-neutral-background-secondary rounded text-sm w-fit min-w-full",
          node.type === "folder" && hasChildren && "cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          paddingLeft: `${node.level * SPACING.LEVEL_INDENT + SPACING.BASE_PADDING}px`,
        }}
        onClick={() =>
          node.type === "folder" && hasChildren && toggleFolder(node.id)
        }
      >
        {/* Expand/Collapse Icon */}
        {node.type === "folder" && hasChildren && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-neutral-text-secondary" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-neutral-text-secondary" />
            )}
          </div>
        )}

        {/* Spacing for files or folders without children */}
        {(node.type === "file" || !hasChildren) && (
          <div className="w-4 flex-shrink-0" />
        )}

        {/* File/Folder Icon */}
        <div className="flex-shrink-0">
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpenIcon className="h-4 w-4 text-blue-500" />
            ) : (
              <FolderIcon className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <DocumentIcon className="h-4 w-4 text-neutral-text-secondary" />
          )}
        </div>

        {/* Name */}
        <span
          className={`text-neutral-text whitespace-nowrap ${node.type === "folder" ? "font-medium" : ""} pr-2`}
        >
          {node.name}
        </span>
      </div>

      {/* Children */}
      {node.type === "folder" &&
        isExpanded &&
        node.children.map((child) => (
          <FileTreeItem
            key={child.id}
            node={child}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
    </div>
  );
};

export const FileStructure = ({
  fileStructure,
  caption,
}: FileStructureProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(fileStructure?.map((item) => item.id) ?? [])
  );

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.has(id)
        ? new Set([...prev].filter((item) => item !== id))
        : new Set(prev).add(id)
    );
  };

  if (!fileStructure?.length) return null;

  const treeNodes = buildTree(fileStructure);

  return (
    <div className="my-8">
      <div className="bg-background-brand-code border border-neutral-border rounded-xl overflow-hidden shadow-md">
        {/* File Tree */}
        <div className="p-4 font-mono text-sm overflow-x-scroll mr-4">
          {treeNodes.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      </div>
      {caption && (
        <div className="font-tuner text-sm text-neutral-text-secondary mt-2">
          Figure: {caption}
        </div>
      )}
    </div>
  );
};
