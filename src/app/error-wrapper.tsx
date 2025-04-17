"use client"

import Image from "next/image";
import Link from "next/link";

const ErrorWrapper = ({ description, errorConfig }: { description: string, errorConfig: any }) => {
    

  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <div className="grid grid-cols-1 items-center gap-8 py-24 md:grid-cols-2">
        <div className="flex flex-col items-center text-center">
          <div className="mb-7">
            <h2 className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text font-tuner text-6xl text-transparent">
              {errorConfig?.errorPageTitle ?? "Sorry, Friend."}
            </h2>
            {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
            <hr className="my-8 block h-[7px] w-full border-none bg-[url('/svg/hr.svg')] bg-[length:auto_100%] bg-no-repeat" />
            {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
            <p className="to-blue-1000 -mb-1 block bg-gradient-to-br from-blue-700 to-blue-900 bg-clip-text text-lg text-transparent lg:text-xl lg:leading-normal">
              {description ?? "We couldn't find what you were looking for."}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {errorConfig?.errorLinks?.map(
              (link) =>
                (link?.linkUrl || link?.linkUrl === "") && (
                  <Link
                    href={link.linkUrl}
                    passHref
                    className="text-slate-500 shadow-sm hover:shadow-md outline outline-slate-200 hover:text-slate-700 rounded-md p-2 bg-white/50 hover:bg-white/90"
                  >
                    <div>{link.linkText ?? "External Link 🔗"}</div>
                  </Link>
                )
            )}
          </div>
        </div>
        {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
        <div className="mx-auto max-w-[65vw] md:max-w-none">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src="/img/rico-replacement.jpg"
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
