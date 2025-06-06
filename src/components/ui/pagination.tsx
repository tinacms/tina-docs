import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
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
    <div className="flex justify-between mt-12 py-4  rounded-lg gap-4 overflow-hidden">
      {prevPage?.slug ? (
        <DynamicLink href={prevPage.slug} passHref>
          <div className="group relative block cursor-pointer p-4 text-left transition-all">
            <span className="pl-10 text-sm uppercase opacity-50">Previous</span>
            <h5 className="pl m-0 flex items-center text-base leading-[1.3] text-brand-secondary transition-all duration-150 ease-out group-hover:text-orange-500 md:text-xl">
              <MdChevronLeft className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-orange-500" />
              {prevPage.title}
            </h5>
          </div>
        </DynamicLink>
      ) : (
        <div />
      )}
      {nextPage?.slug ? (
        <DynamicLink href={nextPage.slug} passHref>
          <div className="group relative col-start-2 block cursor-pointer p-4 text-right transition-all">
            <span className="pr-6 text-sm uppercase opacity-50 md:pr-10">
              Next
            </span>
            <h5 className="m-0 flex items-center justify-end text-base leading-[1.3] text-brand-secondary transition-all duration-150 ease-out group-hover:text-orange-500 md:text-xl">
              {nextPage.title}
              <MdChevronRight className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-orange-500" />
            </h5>
          </div>
        </DynamicLink>
      ) : (
        <div />
      )}
    </div>
  );
}
