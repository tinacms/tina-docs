import React from "react";
import { DynamicLink } from "./dynamic-link";

interface NextPrevPageProps {
  title: string;
  slug: string;
}

interface PaginationProps {
  prevPage?: NextPrevPageProps;
  nextPage?: NextPrevPageProps;
}

export function Pagination({ prevPage, nextPage }: PaginationProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      {prevPage?.slug && (
        <DynamicLink href={prevPage.slug} passHref>
          <div className="group relative block cursor-pointer p-4 text-left transition-all">
            <span className="pl-10 text-sm uppercase opacity-50">Previous</span>
            <h5 className="pl m-0 flex items-center text-base leading-[1.3] text-brand-secondary transition-all duration-150 ease-out group-hover:text-orange-500 md:text-xl">
              <svg
                viewBox="0 0 32 32"
                className="mr-2 size-7 rotate-180 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-orange-500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.20799L20.2099 16L11 24.792Z" />
              </svg>
              {prevPage.title}
            </h5>
          </div>
        </DynamicLink>
      )}
      {nextPage?.slug && (
        <DynamicLink href={nextPage.slug} passHref>
          <div className="group relative col-start-2 block cursor-pointer p-4 text-right transition-all">
            <span className="pr-6 text-sm uppercase opacity-50 md:pr-10">
              Next
            </span>
            <h5 className="m-0 flex items-center justify-end text-base leading-[1.3] text-brand-secondary transition-all duration-150 ease-out group-hover:text-orange-500 md:text-xl">
              {nextPage.title}
              <svg
                viewBox="0 0 32 32"
                className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-orange-500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 24.792L12.2654 26L21.4773 17.2061C22.1747 16.5403 22.1737 15.4588 21.4773 14.7939L12.2654 6L11 7.20799L20.2099 16L11 24.792Z" />
              </svg>
            </h5>
          </div>
        </DynamicLink>
      )}
    </div>
  );
}
