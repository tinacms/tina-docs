"use client";
import Editor from "@monaco-editor/react";
import debounce from "lodash/debounce";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { wrapFieldsWithMeta } from "tinacms";

const MINIMUM_HEIGHT = 75;

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
  const [isLoaded, setIsLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const lastSavedValue = useRef(input.value || "");

  const updateTinaValue = useCallback(
    debounce((newValue: string) => {
      lastSavedValue.current = newValue;
      input.onChange(newValue);
    }, 100),
    []
  );

  useEffect(() => {
    if (input.value !== lastSavedValue.current && input.value !== value) {
      setValue(input.value || "");
      lastSavedValue.current = input.value || "";
    }
  }, [input.value, value]);

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;

      if (monaco?.languages?.typescript) {
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });
      }

      editor.onDidContentSizeChange(() => {
        const contentHeight = Math.max(
          editor.getContentHeight(),
          MINIMUM_HEIGHT
        );
        setEditorHeight(contentHeight);
        editor.layout();
      });

      editor.onDidChangeModelContent(() => {
        const currentValue = editor.getValue();
        if (currentValue !== lastSavedValue.current) {
          setValue(currentValue);
          updateTinaValue(currentValue);
        }
      });

      // Mark as loaded and focus after a brief delay for smooth transition
      setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => {
          try {
            editorRef.current?.focus();
          } catch (e) {
            // Error focusing editor silently ignored
          }
        }, 200);
      }, 100);
    },
    [updateTinaValue]
  );

  const handleBeforeMount = useCallback(() => {}, []);

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
        {`.monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
          padding: 0 1rem !important;
        }
        .editor-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .editor-loading {
          background: linear-gradient(90deg, #1e1e1e 0%, #2d2d2d 50%, #1e1e1e 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }`}
      </style>
      <div
        className={`editor-container ${!isLoaded ? "editor-loading" : ""}`}
        style={{
          height: `${editorHeight}px`,
          opacity: isLoaded ? 1 : 0.7,
          transform: isLoaded ? "scale(1)" : "scale(0.98)",
          position: "relative",
        }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm z-10 rounded-lg overflow-hidden">
            Loading editor...
          </div>
        )}
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={value}
          options={editorOptions}
          onMount={handleEditorDidMount}
          beforeMount={handleBeforeMount}
        />
      </div>
    </div>
  );
});

export default MonacoCodeEditor;
