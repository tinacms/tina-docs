"use client";

import Image from "next/image";
import Link from "next/link";

const ErrorWrapper = ({
  errorConfig,
}: {
  errorConfig: {
    description: string;
    title: string;
    links: { linkText: string; linkUrl: string }[];
  };
}) => {
  return (
    <div className="container mx-auto flex h-screen items-start justify-center">
      <div className="grid grid-cols-1 items-center gap-8 py-24 md:grid-cols-2">
        <div className="flex flex-col items-center text-center">
          <div className="mb-7">
            <h2 className="bg-gradient-to-r from-brand-secondary-gradient-start to-brand-secondary-gradient-end bg-clip-text font-heading text-6xl leading-normal h-fit text-transparent">
              {errorConfig?.title ?? "Sorry, Friend."}
            </h2>
            <hr className="block h-[7px] w-full border-none bg-[url('/svg/hr.svg')] bg-[length:auto_100%] bg-no-repeat" />
            <p className="-mb-1 block text-neutral-text font-thin text-md lg:text-lg lg:leading-normal">
              {errorConfig?.description ??
                "We couldn't find what you were looking for."}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {errorConfig?.links?.map(
              (link) =>
                (link?.linkUrl || link?.linkUrl === "") && (
                  <a
                    key={link.linkUrl}
                    href={link.linkUrl}
                    className="text-neutral-text-secondary shadow-sm hover:shadow-md outline outline-neutral-border-subtle hover:text-neutral-text rounded-md p-2 bg-neutral-background hover:bg-neutral-background-secondary"
                  >
                    <div>{link.linkText ?? "External Link 🔗"}</div>
                  </a>
                )
            )}
          </div>
        </div>
        <div className="mx-auto max-w-[65vw] md:max-w-none">
          <div className="relative aspect-square overflow-hidden flex items-center justify-center">
            <Image
              src={`${
                process.env.NEXT_PUBLIC_BASE_PATH || ""
              }/img/404-image.jpg`}
              alt="404 Llama"
              className="rounded-3xl object-cover"
              width={364}
              height={364}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorWrapper;
