"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Global flag to ensure mermaid is only initialized once
let mermaidInitialized = false;

function MermaidDiagramClient(data: { value?: string }) {
  const { value } = data;
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Only mount on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !value || !mermaidRef.current) return;

    const renderDiagram = async () => {
      try {
        // Dynamically import mermaid to ensure it's only loaded on client
        const mermaid = (await import("mermaid")).default;

        // Initialize mermaid only once globally
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
          });
          mermaidInitialized = true;
        }

        // Generate unique ID for this render
        const diagramId = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Render the specific diagram with unique ID
        const { svg } = await mermaid.render(diagramId, value);

        // Insert the rendered SVG into the DOM
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (error) {
        // Fallback to showing the raw text
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<pre>${value}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [mounted, value]);

  return (
    <div contentEditable={false}>
      <div
        ref={mermaidRef}
        className="mermaid-container dark:bg-brand-primary-contrast w-fit rounded-md p-4"
      >
        <pre className="mermaid">{value}</pre>
      </div>
    </div>
  );
}

// Export as dynamic component with no SSR
export default dynamic(() => Promise.resolve(MermaidDiagramClient), {
  ssr: false,
});
