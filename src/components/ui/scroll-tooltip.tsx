import React from "react";

interface ScrollTooltipProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function ScrollTooltip({
  show,
  message = "Scroll or swipe to navigate",
  className = "",
}: ScrollTooltipProps) {
  return (
    <div
      className={`absolute top-2 left-1/2 z-50 -translate-x-full transition-all duration-1000 ease-out ${
        show
          ? "opacity-100 transform translate-y-full"
          : "opacity-0 transform translate-y-[70%]"
      } ${className}`}
    >
      <div className="backdrop-blur-sm bg-brand-primary/20 rounded-lg px-4 py-3 shadow-lg border border-brand-primary/20 animate-gentle-bounce">
        <div className="flex items-center gap-3 text-neutral-text text-sm">
          <div className="flex flex-col items-center gap-1">
            <div className="text-neutral-text/80 text-xs">↑</div>
            <div className="text-neutral-text/80 text-xs">↓</div>
          </div>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}

export function useScrollTooltip() {
  const [showTooltip, setShowTooltip] = React.useState(true);

  const hideTooltip = React.useCallback(() => {
    setShowTooltip(false);
  }, []);

  const showTooltipAgain = React.useCallback(() => {
    setShowTooltip(true);
  }, []);

  return {
    showTooltip,
    hideTooltip,
    showTooltipAgain,
  };
}
