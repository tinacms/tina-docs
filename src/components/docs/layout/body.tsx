import { Breadcrumbs } from "@/components/docs/breadcrumbs";

export const Body = ({
  navigationDocsData,
  children,
}: {
  navigationDocsData: any;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div data-pagefind-body id="doc-content">
        {children}
      </div>
    </>
  );
};
