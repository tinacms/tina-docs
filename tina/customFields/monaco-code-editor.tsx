"use client";
import debounce from "lodash/debounce";
import dynamic from "next/dynamic";
import React, { useEffect, useState, useRef } from "react";
import { wrapFieldsWithMeta } from "tinacms";

const MINIMUM_HEIGHT = 75;

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as any;

if (typeof window !== "undefined") {
  import("@monaco-editor/react")
    .then(({ loader }) => {
      loader.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs",
        },
      });
    })
    .catch((e) => {
      // Failed to load Monaco editor
    });
}

const MonacoCodeEditor = wrapFieldsWithMeta(({ input }) => {
  const [value, setValue] = useState(input.value || "");
  const [editorHeight, setEditorHeight] = useState(MINIMUM_HEIGHT);
  const editorRef = useRef<any>(null);
  const lastSavedValue = useRef(input.value || "");

  const updateTinaValue = debounce((newValue: string) => {
    lastSavedValue.current = newValue;
    input.onChange(newValue);
  }, 100);

  useEffect(() => {
    // Only update if the value coming from Tina is different from what we last saved
    if (input.value !== lastSavedValue.current && input.value !== value) {
      setValue(input.value || "");
      lastSavedValue.current = input.value || "";
    }
  }, [input.value, value]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    if (monaco?.languages?.typescript) {
      monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }

    editor.onDidContentSizeChange(() => {
      const contentHeight = Math.max(editor.getContentHeight(), MINIMUM_HEIGHT);
      setEditorHeight(contentHeight);
      editor.layout();
    });

    // Add listener for all content changes including auto-completions
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue();
      if (currentValue !== lastSavedValue.current) {
        setValue(currentValue);
        updateTinaValue(currentValue);
      }
    });

    if (editorRef.current) {
      setTimeout(() => {
        try {
          editorRef.current.focus();
        } catch (e) {
          // Error focusing editor silently ignored
        }
      }, 100);
    }
  };

  const editorOptions = {
    scrollBeyondLastLine: false,
    tabSize: 2,
    disableLayerHinting: true,
    accessibilitySupport: "off" as const,
    codeLens: false,
    wordWrap: "on" as const,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
    lineHeight: 2,
    formatOnPaste: true,
    lineNumbers: "on" as const,
    formatOnType: true,
    fixedOverflowWidgets: true,
    folding: false,
    renderLineHighlight: "none" as const,
    scrollbar: {
      verticalScrollbarSize: 1,
      horizontalScrollbarSize: 1,
      alwaysConsumeMouseWheel: false,
    },
    automaticLayout: true,
  };

  return (
    <div className="relative mb-2 mt-0.5 rounded-lg shadow-md border-gray-200 border overflow-hidden">
      <style>
        {/* Disable hints that might interfere with UI */}
        {`.monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
          padding: 0 1rem !important;
        }`}
      </style>
      <div style={{ height: `${editorHeight}px` }}>
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={value}
          options={editorOptions}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
});

export default MonacoCodeEditor;
