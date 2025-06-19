import React from "react";

export const CodeBlockSkeleton = () => {
  return (
    <div className="relative w-full my-2">
      <div className="absolute top-0 right-0 z-10 px-4 py-1 text-xs font-mono text-neutral-text-secondary">
        <div className="w-8 h-3 bg-neutral-border-subtle rounded animate-pulse" />
      </div>

      <div className="shiki w-full overflow-x-auto bg-background-brand-code py-4 px-2 text-sm border border-neutral-border-subtle shadow-sm rounded-lg">
        <div className="space-y-2">
          {/* Generate skeleton lines */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Line number skeleton */}
              <div className="w-8 h-4 bg-neutral-border-subtle rounded animate-pulse flex-shrink-0" />

              {/* Code content skeleton */}
              <div className="flex-1 space-y-1">
                <div
                  className="h-4 bg-neutral-border-subtle rounded animate-pulse"
                  style={{
                    width: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
                {index % 3 === 0 && (
                  <div
                    className="h-4 bg-neutral-border-subtle rounded animate-pulse"
                    style={{
                      width: `${Math.random() * 40 + 15}%`,
                      animationDelay: `${index * 0.1 + 0.05}s`,
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
