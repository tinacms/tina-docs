import React, { useEffect, useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";
import dynamic from "next/dynamic";
import debounce from "lodash/debounce";

// Dynamically import Monaco Editor with no SSR to avoid hydration issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
}) as any;

const MonacoCodeEditor = wrapFieldsWithMeta(({ input }) => {
  const [value, setValue] = useState(input.value || "");

  // Update Tina value with moderate debounce
  const updateTinaValue = debounce((newValue) => {
    input.onChange(newValue);
  }, 1);

  // Keep local state in sync with input
  useEffect(() => {
    if (input.value !== value) {
      setValue(input.value || "");
    }
  }, [input.value]);

  // Handle editor changes
  const handleEditorChange = (newValue: string | undefined) => {
    const editorValue = newValue || "";
    setValue(editorValue);
    updateTinaValue(editorValue);
  };

  // Basic editor settings
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        border: "1px solid #ccc",
        overflow: "hidden",
      }}
    >
      <MonacoEditor
        height="100%"
        width="100%"
        language="javascript"
        theme="vs-dark"
        value={value}
        options={editorOptions}
        onChange={handleEditorChange}
      />
    </div>
  );
});

export default MonacoCodeEditor;
