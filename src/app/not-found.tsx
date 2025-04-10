import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <div className="grid grid-cols-1 items-center gap-8 py-24 md:grid-cols-2">
        <div className="flex flex-col items-center text-center">
          <div className="mb-7">
            <h2 className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text font-tuner text-6xl text-transparent">
              Sorry, Friend.
            </h2>
            <hr className="my-8 block h-[7px] w-full border-none bg-[url('/svg/hr.svg')] bg-[length:auto_100%] bg-no-repeat" />
            <p className="to-blue-1000 -mb-1 block bg-gradient-to-br from-blue-700 via-blue-900 bg-clip-text text-lg text-transparent lg:text-xl lg:leading-normal">
              We couldn&apos;t find what you were looking for.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="https://tina.io/docs" passHref>
              <div>Documentation</div>
            </Link>
            <Link href="https://tina.io/docs/guides" passHref>
              <div>Guides</div>
            </Link>
            <Link href="https://tina.io/" passHref>
              <div>Home</div>
            </Link>
          </div>
        </div>
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
}
