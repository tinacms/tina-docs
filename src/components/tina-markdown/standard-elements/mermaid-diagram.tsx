"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

export default function MermaidDiagram(data: { value?: string }) {
  const { value } = data;
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.run();
    }
  }, []);

  return (
    <div contentEditable={false}>
      <div ref={mermaidRef}>
        <pre className="mermaid">{value}</pre>
      </div>
    </div>
  );
}
