"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
  FolderIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import React from "react";
import type { DragEvent, KeyboardEvent } from "react";

// Types
export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
}

export interface TreeNode extends FileItem {
  children: TreeNode[];
  level: number;
}

export interface DragState {
  draggedId: string | null;
  dragOverId: string | null;
  dropPosition: "before" | "after" | "inside" | null;
}

export interface EditState {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export interface DragActions {
  dragState: DragState;
  setDragState: (state: DragState) => void;
}

export interface TreeState {
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
}

export interface FileTreeItemProps {
  node: TreeNode;
  editState: EditState;
  dragActions: DragActions;
  treeState: TreeState;
  onUpdate: (id: string, updates: Partial<FileItem>) => void;
  onDelete: (id: string) => void;
  onMove: (
    draggedId: string,
    targetId: string | null,
    position: "before" | "after" | "inside"
  ) => void;
}

// Constants for drag and drop
export const DRAG_STATE_RESET: DragState = {
  draggedId: null,
  dragOverId: null,
  dropPosition: null,
};

const DROP_ZONES = {
  BEFORE_THRESHOLD: 0.25,
  AFTER_THRESHOLD: 0.75,
  FILE_MIDDLE_THRESHOLD: 0.5,
} as const;

const SPACING = {
  LEVEL_INDENT: 20,
  BASE_PADDING: 8,
} as const;

export const FileTreeItem = ({
  node,
  editState,
  dragActions,
  treeState,
  onUpdate,
  onDelete,
  onMove,
}: FileTreeItemProps) => {
  const { editingId, setEditingId } = editState;
  const { dragState, setDragState } = dragActions;
  const { expandedFolders, toggleFolder } = treeState;
  const [editName, setEditName] = useState(node.name);
  const isExpanded = expandedFolders.has(node.id);
  const hasChildren = node.children.length > 0;
  const isEditing = editingId === node.id;
  const isDragging = dragState.draggedId === node.id;
  const isDragOver = dragState.dragOverId === node.id;

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(node.id, { name: editName.trim() });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditName(node.name);
    setEditingId(null);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") handleCancel();
  };

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
    setDragState({ ...DRAG_STATE_RESET, draggedId: node.id });
  };

  const handleDragEnd = () => setDragState(DRAG_STATE_RESET);

  const getDropPosition = (
    e: DragEvent,
    rect: DOMRect
  ): "before" | "after" | "inside" => {
    const relativeY = (e.clientY - rect.top) / rect.height;

    if (node.type === "folder") {
      if (relativeY < DROP_ZONES.BEFORE_THRESHOLD) return "before";
      if (relativeY > DROP_ZONES.AFTER_THRESHOLD) return "after";
      return "inside";
    }

    return relativeY < DROP_ZONES.FILE_MIDDLE_THRESHOLD ? "before" : "after";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!dragState.draggedId) return;

    setDragState({
      ...dragState,
      dragOverId: node.id,
      dropPosition: getDropPosition(e, e.currentTarget.getBoundingClientRect()),
    });
  };

  const handleDragLeave = (e: DragEvent) => {
    // Only clear if we're leaving this element entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState({
        ...dragState,
        dragOverId: null,
        dropPosition: null,
      });
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!dragState.draggedId || !dragState.dropPosition) return;
    onMove(dragState.draggedId, node.id, dragState.dropPosition);
    setDragState(DRAG_STATE_RESET);
  };

  const getDropIndicatorClass = () => {
    if (!isDragOver || !dragState.dropPosition) return "";

    const indicators = {
      before: "border-t-2 border-blue-500",
      after: "border-b-2 border-blue-500",
      inside: "bg-blue-50 border border-blue-300",
    };

    return indicators[dragState.dropPosition] || "";
  };

  const leftPadding = node.level * SPACING.LEVEL_INDENT + SPACING.BASE_PADDING;

  return (
    <div>
      <div
        className={[
          "flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded text-sm group relative w-fit min-w-full",
          !isEditing && "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50",
          getDropIndicatorClass(),
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          paddingLeft: `${leftPadding}px`,
        }}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse Icon */}
        {node.type === "folder" && hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(node.id);
            }}
            className="flex-shrink-0 hover:bg-gray-200 rounded p-0.5"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3 text-gray-600" />
            ) : (
              <ChevronRightIcon className="h-3 w-3 text-gray-600" />
            )}
          </button>
        )}

        {(node.type === "file" || !hasChildren) && (
          <div className="w-4 flex-shrink-0" />
        )}

        {/* File/Folder Icon */}
        <div className="flex-shrink-0">
          {node.type === "folder" ? (
            <FolderIcon className="h-4 w-4 text-blue-500" />
          ) : (
            <DocumentIcon className="h-4 w-4 text-gray-500" />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="w-full px-1 py-0.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <span
              className={`cursor-pointer ${node.type === "folder" ? "font-medium" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(node.id);
              }}
            >
              {node.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-red-100 rounded"
            title="Delete"
          >
            <TrashIcon className="h-3 w-3 text-red-600" />
          </button>
        </div>
      </div>

      {/* Children */}
      {node.type === "folder" &&
        isExpanded &&
        node.children.map((child) => (
          <FileTreeItem
            // @ts-expect-error - key is not a prop of FileTreeItemProps, false positive
            key={child.id}
            node={child}
            editState={{ editingId, setEditingId }}
            dragActions={{ dragState, setDragState }}
            treeState={{ expandedFolders, toggleFolder }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
    </div>
  );
};
