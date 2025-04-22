import type React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const SiteLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // eslint-disable-next-line tailwindcss/no-arbitrary-value, tailwindcss/no-custom-classname
    <div className="blob-bg font-sans flex min-h-screen flex-col bg-blob-bg bg-[length:100%_100%] bg-fixed bg-top">
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};
