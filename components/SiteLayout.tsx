import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const SiteLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      className="flex flex-col min-h-screen font-sans"
      style={{
        backgroundImage: "var(--default-background-image)",
        backgroundSize: "100% 100%",
        backgroundPosition: "top",
        backgroundAttachment: "fixed",
        
      }}
    >
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
};
