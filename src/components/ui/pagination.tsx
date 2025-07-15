import { usePathname } from "next/navigation";
import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useNavigation } from "../docs/layout/navigation-context";
import { DynamicLink } from "./dynamic-link";

export function Pagination() {
  const [prevPage, setPrevPage] = React.useState<any>(null);
  const [nextPage, setNextPage] = React.useState<any>(null);
  const pathname = usePathname();
  const docsData = useNavigation();

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
              title: item.slug.title,
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
    const slug =
      pathname === "/docs"
        ? "content/docs/index.mdx"
        : `content${pathname}.mdx`;

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
    <div className="flex justify-between mt-2 py-4 rounded-lg gap-4 w-full">
      {prevPage?.slug ? (
        //Slices to remove content/ and .mdx from the filepath, and removes /index for index pages
        <DynamicLink
          href={prevPage.slug.slice(7, -4).replace(/\/index$/, "/")}
          passHref
        >
          <div className="group relative block cursor-pointer py-4 text-left transition-all">
            <span className="pl-10 text-sm uppercase opacity-50 group-hover:opacity-100 text-neutral-text-secondary">
              Previous
            </span>
            <h5 className="pl m-0 flex items-center font-light leading-[1.3] text-brand-secondary opacity-80 group-hover:opacity-100 transition-all duration-150 ease-out group-hover:text-brand-primary md:text-xl">
              <MdChevronLeft className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-brand-primary" />
              <span className="relative brand-secondary-gradient">
                {prevPage.title}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-brand-secondary-gradient-start to-brand-secondary-gradient-end group-hover:w-full transition-all duration-300 ease-in-out" />
              </span>
            </h5>
          </div>
        </DynamicLink>
      ) : (
        <div />
      )}
      {nextPage?.slug ? (
        //Slices to remove content/ and .mdx from the filepath, and removes /index for index pages
        <DynamicLink
          href={nextPage.slug.slice(7, -4).replace(/\/index$/, "/")}
          passHref
        >
          <div className="group relative col-start-2 block cursor-pointer p-4 text-right transition-all">
            <span className="pr-6 text-sm uppercase opacity-50 md:pr-10 group-hover:opacity-100 text-neutral-text-secondary">
              Next
            </span>
            <h5 className="m-0 flex items-center justify-end font-light leading-[1.3] text-brand-secondary opacity-80 group-hover:opacity-100 transition-all duration-150 ease-out group-hover:text-brand-primary md:text-xl">
              <span className="relative brand-secondary-gradient">
                {nextPage.title}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-brand-secondary-gradient-start to-brand-secondary-gradient-end group-hover:w-full transition-all duration-300 ease-in-out" />
              </span>
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
