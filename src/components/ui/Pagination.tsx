import Image from "next/image";
import React from "react";
import { DynamicLink } from "../ui/DynamicLink";

interface NextPrevPageProps {
  title: string;
  slug: string;
}

interface PaginationProps {
  prevPage?: NextPrevPageProps;
  nextPage?: NextPrevPageProps;
}

const NextImage = Image as any;

export function DocsPagination({ prevPage, nextPage }: PaginationProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      {prevPage?.slug && (
        <DynamicLink href={prevPage.slug} passHref>
          <div
            className="group relative block cursor-pointer border border-gray-100 p-4 text-left transition-all"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <span className="pl-10 text-sm uppercase opacity-50">Previous</span>
            {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
            <h5 className="pl m-0 flex items-center text-base leading-[1.3] text-blue-800 transition-all duration-150 ease-out group-hover:text-orange-500 md:text-xl">
              <NextImage
                src="/svg/right-arrow.svg"
                alt="Right arrow"
                width={28}
                height={28}
                className="mr-2 size-7 rotate-180 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-orange-500"
              />
              {prevPage.title}
            </h5>
          </div>
        </DynamicLink>
      )}
      {nextPage?.slug && (
        <DynamicLink href={nextPage.slug} passHref>
          <div
            className="group relative col-start-2 block cursor-pointer border border-gray-100 p-4 text-right transition-all"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <span className="pr-6 text-sm uppercase opacity-50 md:pr-10">
              Next
            </span>
            {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
            <h5 className="m-0 flex items-center justify-end text-base leading-[1.3] text-blue-800 transition-all duration-150 ease-out group-hover:text-orange-500 md:text-xl">
              {nextPage.title}
              <NextImage
                src="/svg/right-arrow.svg"
                alt="Right arrow"
                width={28}
                height={28}
                className="ml-2 size-7 fill-gray-400 transition-all duration-150 ease-out group-hover:fill-orange-500"
              />
            </h5>
          </div>
        </DynamicLink>
      )}
    </div>
  );
}

export default DocsPagination;
