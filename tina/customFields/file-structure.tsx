"use client";

import { DocumentIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import React from "react";
import { wrapFieldsWithMeta } from "tinacms";
import {
  DRAG_STATE_RESET,
  type DragState,
  type FileItem,
  FileTreeItem,
  type TreeNode,
} from "./file-structure.item";

// Convert flat array to tree structure
const buildTree = (items: FileItem[]): TreeNode[] => {
  const itemMap = new Map<string, TreeNode>();
  const rootItems: TreeNode[] = [];

  for (const item of items) {
    itemMap.set(item.id, {
      ...item,
      children: [],
      level: 0,
    });
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

  return rootItems;
};

export const FileStructureField = wrapFieldsWithMeta(({ input }) => {
  const items: FileItem[] = input.value || [];
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>(DRAG_STATE_RESET);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.has(id)
        ? new Set([...prev].filter((item) => item !== id))
        : new Set(prev).add(id)
    );
  };

  const isValidDrop = (draggedId: string, targetId: string): boolean => {
    if (draggedId === targetId) return false;

    const draggedItem = items.find((item) => item.id === draggedId);
    if (draggedItem?.type !== "folder") return true;

    // Check if target is a descendant of dragged folder
    const isDescendant = (parentId: string, checkId: string): boolean =>
      items.some(
        (item) =>
          item.parentId === parentId &&
          (item.id === checkId || isDescendant(item.id, checkId))
      );

    return !isDescendant(draggedId, targetId);
  };

  const moveItem = (
    draggedId: string,
    targetId: string | null,
    position: "before" | "after" | "inside"
  ) => {
    if (!isValidDrop(draggedId, targetId || "")) return;

    const draggedItem = items.find((item) => item.id === draggedId);
    const targetItem = targetId
      ? items.find((item) => item.id === targetId)
      : null;
    if (!draggedItem || !targetItem) return;

    const filteredItems = items.filter((item) => item.id !== draggedId);
    const targetIndex = filteredItems.findIndex((item) => item.id === targetId);
    if (targetIndex === -1) return;

    let insertIndex: number;
    let newParentId: string | null;

    if (position === "inside" && targetItem.type === "folder" && targetId) {
      newParentId = targetId;
      setExpandedFolders((prev) => new Set(prev).add(targetId));

      // Insert after last child or after target folder
      const lastChild = filteredItems.findLastIndex(
        (item) => item.parentId === targetId
      );
      insertIndex = lastChild !== -1 ? lastChild + 1 : targetIndex + 1;
    } else {
      newParentId = targetItem.parentId;
      insertIndex = position === "before" ? targetIndex : targetIndex + 1;
    }

    filteredItems.splice(insertIndex, 0, {
      ...draggedItem,
      parentId: newParentId,
    });
    input.onChange(filteredItems);
  };

  const addItem = (parentId: string | null, type: "file" | "folder") => {
    const newItem: FileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === "folder" ? "New Folder" : "new-file.txt",
      type,
      parentId,
    };
    input.onChange([...items, newItem]);
    setEditingId(newItem.id);

    if (parentId) {
      setExpandedFolders((prev) => new Set(prev).add(parentId));
    }
  };

  const updateItem = (id: string, updates: Partial<FileItem>) => {
    input.onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    const getChildIds = (parentId: string): string[] =>
      items
        .filter((item) => item.parentId === parentId)
        .flatMap((child) => [child.id, ...getChildIds(child.id)]);

    const idsToDelete = new Set([id, ...getChildIds(id)]);
    input.onChange(items.filter((item) => !idsToDelete.has(item.id)));
  };

  const treeNodes = buildTree(items);

  return (
    <div className="w-full">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addItem(null, "folder")}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FolderIcon className="h-3 w-3" />
              Add Folder
            </button>
            <button
              type="button"
              onClick={() => addItem(null, "file")}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              <DocumentIcon className="h-3 w-3" />
              Add File
            </button>
          </div>
        </div>

        {/* File Tree */}
        <div className="p-4 min-h-[200px] font-mono text-sm">
          {treeNodes.length === 0 ? (
            <div className="text-center text-gray-500 py-8 max-w-full break-words text-wrap">
              <div className="mb-2">No files or folders yet</div>
              <div className="text-xs">
                Click "Add Folder" or "Add File" to get started
              </div>
            </div>
          ) : (
            treeNodes.map((node) => (
              <div
                key={`file-tree-item-${node.id}`}
                className="w-full overflow-x-scroll"
              >
                <FileTreeItem
                  node={node}
                  editState={{ editingId, setEditingId }}
                  dragActions={{ dragState, setDragState }}
                  treeState={{ expandedFolders, toggleFolder }}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                  onMove={moveItem}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current items count */}
      <div className="mt-2 text-xs text-gray-500">
        {items.length} item{items.length !== 1 ? "s" : ""} total
      </div>
    </div>
  );
});
