import { usePathname } from "next/navigation";
import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { DynamicLink } from "./dynamic-link";

export function Pagination({ docsData }: { docsData: any }) {
  const [prevPage, setPrevPage] = React.useState<any>(null);
  const [nextPage, setNextPage] = React.useState<any>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    if (!docsData?.data) return;

    // Flatten the hierarchical structure into a linear array
    const flattenItems = (items: any[]): any[] => {
      const flattened: any[] = [];

      const traverse = (itemList: any[]) => {
        for (const item of itemList) {
          if (item.slug) {
            flattened.push({
              slug: item.slug.id,
              title: item.title,
            });
          }
          if (item.items) {
            // This has nested items, traverse them
            traverse(item.items);
          }
        }
      };

      traverse(items);
      return flattened;
    };

    const getAllPages = (): any[] => {
      const allPages: any[] = [];

      for (const tab of docsData.data) {
        if (tab.items) {
          const flattenedItems = flattenItems(tab.items);
          allPages.push(...flattenedItems);
        }
      }

      return allPages;
    };

    // Get current slug from pathname
    const slug = `content${pathname}.mdx`;

    // Get all pages in sequence
    const allPages = getAllPages();

    // Find current page index
    const currentIndex = allPages.findIndex((page: any) => page.slug === slug);

    if (currentIndex !== -1) {
      // Set previous page (if exists)
      const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
      setPrevPage(prev);

      // Set next page (if exists)
      const next =
        currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;
      setNextPage(next);
    } else {
      setPrevPage(null);
      setNextPage(null);
    }
  }, [docsData, pathname]);

  return (
    <div className="flex justify-between mt-2 py-4  rounded-lg gap-4 overflow-hidden">
      {prevPage?.slug ? (
        <DynamicLink href={prevPage.slug.slice(7, -4)} passHref>
          <div className="group relative block cursor-pointer p-4 text-left transition-all">
            <span className="pl-10 text-sm uppercase opacity-50">Previous</span>
            <h5 className="pl m-0 flex items-center text-base leading-[1.3] text-brand-secondary transition-all duration-150 ease-out group-hover:text-brand-primary md:text-xl">
              <MdChevronLeft className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-brand-primary" />
              {prevPage.title}
            </h5>
          </div>
        </DynamicLink>
      ) : (
        <div />
      )}
      {nextPage?.slug ? (
        <DynamicLink href={nextPage.slug.slice(7, -4)} passHref>
          <div className="group relative col-start-2 block cursor-pointer p-4 text-right transition-all">
            <span className="pr-6 text-sm uppercase opacity-50 md:pr-10">
              Next
            </span>
            <h5 className="m-0 flex items-center justify-end text-base leading-[1.3] text-brand-secondary transition-all duration-150 ease-out group-hover:text-brand-primary md:text-xl">
              {nextPage.title}
              <MdChevronRight className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-brand-primary" />
            </h5>
          </div>
        </DynamicLink>
      ) : (
        <div />
      )}
    </div>
  );
}
