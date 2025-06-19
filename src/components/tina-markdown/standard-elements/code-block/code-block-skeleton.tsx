import React from "react";

export const CodeBlockSkeleton = () => {
  // Use deterministic values instead of Math.random() to prevent hydration issues
  const skeletonLines = [
    { width: "75%", delay: "0s" },
    { width: "45%", delay: "0.1s" },
    { width: "60%", delay: "0.2s" },
    { width: "35%", delay: "0.3s" },
    { width: "80%", delay: "0.4s" },
    { width: "50%", delay: "0.5s" },
    { width: "65%", delay: "0.6s" },
    { width: "40%", delay: "0.7s" },
  ];

  const secondaryLines = [
    { width: "30%", delay: "0.05s" },
    { width: "25%", delay: "0.15s" },
    { width: "35%", delay: "0.25s" },
    { width: "20%", delay: "0.35s" },
  ];

  return (
    <div className="relative w-full my-2">
      <div className="absolute top-0 right-0 z-10 px-4 py-1 text-xs font-mono text-neutral-text-secondary">
        <div className="w-8 h-3 bg-neutral-border-subtle rounded animate-pulse" />
      </div>

      <div className="shiki w-full overflow-x-auto bg-background-brand-code py-4 px-2 text-sm border border-neutral-border-subtle shadow-sm rounded-lg">
        <div className="space-y-2">
          {/* Generate skeleton lines */}
          {skeletonLines.map((line, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Line number skeleton */}
              <div className="w-8 h-4 bg-neutral-border-subtle rounded animate-pulse flex-shrink-0" />

              {/* Code content skeleton */}
              <div className="flex-1 space-y-1">
                <div
                  className="h-4 bg-neutral-border-subtle rounded animate-pulse"
                  style={{
                    width: line.width,
                    animationDelay: line.delay,
                  }}
                />
                {index % 3 === 0 && (
                  <div
                    className="h-4 bg-neutral-border-subtle rounded animate-pulse"
                    style={{
                      width:
                        secondaryLines[
                          Math.floor(index / 3) % secondaryLines.length
                        ]?.width || "25%",
                      animationDelay:
                        secondaryLines[
                          Math.floor(index / 3) % secondaryLines.length
                        ]?.delay || "0.05s",
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
