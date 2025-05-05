import React, { useEffect, useState, useRef } from "react";
import { wrapFieldsWithMeta } from "tinacms";
import dynamic from "next/dynamic";
import debounce from "lodash/debounce";

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
    .catch((e) => console.error("Failed to load Monaco editor:", e));
}

const MonacoCodeEditor = wrapFieldsWithMeta(({ input }) => {
  const [value, setValue] = useState(input.value || "");
  const [editorHeight, setEditorHeight] = useState(MINIMUM_HEIGHT);
  const editorRef = useRef<any>(null);

  const updateTinaValue = debounce((newValue: string) => {
    input.onChange(newValue);
  }, 1);

  useEffect(() => {
    if (input.value !== value) {
      setValue(input.value || "");
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

  const handleEditorChange = (newValue: string | undefined) => {
    setValue(newValue || "");
    updateTinaValue(newValue || "");
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
    <div className="relative mb-2 mt-0.5 rounded-lg shadow-md border-gray-200 border">
      <style>
        {/* Disable hints that might interfere with UI */}
        {`.monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
        }`}
      </style>
      <div style={{ height: `${editorHeight}px` }}>
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={value}
          options={editorOptions}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
});

export default MonacoCodeEditor;
