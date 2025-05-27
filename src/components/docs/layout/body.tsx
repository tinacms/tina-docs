import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";

export const Body = ({
  navigationDocsData,
  children,
}: {
  navigationDocsData: any;
  children: React.ReactNode;
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
