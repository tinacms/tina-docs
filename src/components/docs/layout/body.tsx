import { BreadCrumbs } from "@/components/docs/breadcrumbs";

export const Body = ({
  navigationDocsData,
  children,
}: {
  navigationDocsData: any;
  children: React.ReactNode;
}) => {
  return (
    <>
      <BreadCrumbs navigationDocsData={navigationDocsData} />
      <div data-pagefind-body id="doc-content">
        {children}
      </div>
    </>
  );
};
