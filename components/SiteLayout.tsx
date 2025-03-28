import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const SiteLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen blob-bg font-sans bg-blob-bg bg-[length:100%_100%] bg-top bg-fixed">
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
};
