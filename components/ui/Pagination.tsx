import React from 'react'
import Image from 'next/image'
import { DynamicLink } from '../ui/DynamicLink'

interface NextPrevPageProps {
  title: string
  slug: string
}

interface PaginationProps {
  prevPage?: NextPrevPageProps
  nextPage?: NextPrevPageProps
}

const NextImage = Image as any;

export function DocsPagination({ prevPage, nextPage }: PaginationProps) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4">
      {prevPage && prevPage.slug && (
        <DynamicLink href={prevPage.slug} passHref>
          <div
            className="block p-4 text-left relative transition-all group border border-gray-100 cursor-pointer"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            <span className="text-sm uppercase opacity-50 pl-10">Previous</span>
            <h5 className="text-base md:text-xl leading-[1.3] m-0 pl transition-all ease-out duration-150 text-[var(--secondary-color-end)] group-hover:text-[var(--primary-color-via)] flex items-center">
              <NextImage
                src="/svg/right-arrow.svg"
                alt="Right arrow"
                width={28}
                height={28}
                className="w-7 h-7 fill-gray-400 transition-all ease-out duration-150 rotate-180 group-hover:fill-[var(--primary-color-via)] mr-2"
              />
              {prevPage.title}
            </h5>
          </div>
        </DynamicLink>
      )}
      {nextPage && nextPage.slug && (
        <DynamicLink href={nextPage.slug} passHref>
          <div
            className="col-start-2 block p-4 text-right relative transition-all group border border-gray-100 cursor-pointer"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            <span className="text-sm uppercase opacity-50 md:pr-10 pr-6">Next</span>
            <h5 className="text-base md:text-xl leading-[1.3] m-0 transition-all ease-out duration-150 text-[var(--secondary-color-end)] group-hover:text-[var(--primary-color-via)] flex items-center justify-end">
              {nextPage.title}
              <NextImage
                src="/svg/right-arrow.svg"
                alt="Right arrow"
                width={28}
                height={28}
                className="w-7 h-7 fill-gray-400 transition-all ease-out duration-150 group-hover:fill-[var(--primary-color-via)] ml-2"
              />
            </h5>
          </div>
        </DynamicLink>
      )}
    </div>
  )
}

export default DocsPagination
