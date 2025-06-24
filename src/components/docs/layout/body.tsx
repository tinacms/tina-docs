import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { type ReactNode } from "react";

export const Body = ({
  navigationDocsData,
  children,
}: {
  navigationDocsData: any;
  children: ReactNode;
}) => {
  return (
    <>
      <Breadcrumbs navItems={navigationDocsData} />
      <div data-pagefind-body id="doc-content">
        {children}
      </div>
    </>
  );
};
