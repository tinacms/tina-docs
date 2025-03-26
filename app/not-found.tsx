import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="container h-screen mx-auto flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-7">
            <h2 className="font-tuner text-6xl text-transparent bg-clip-text bg-gradient-to-br from-[var(--primary-color-start)] via-[var(--primary-color-via)] to-[var(--primary-color-end)]">
              Sorry, Friend.
            </h2>
            <hr className="block border-none bg-[url('/svg/hr.svg')] bg-no-repeat bg-[length:auto_100%] h-[7px] w-full my-8" />
            <p className="text-lg lg:text-xl lg:leading-normal block bg-gradient-to-br from-[var(--secondary-color-start)] via-[var(--secondary-color-via)] to-[var(--secondary-color-end)] bg-clip-text text-transparent -mb-1">
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
        <div className="max-w-[65vw] mx-auto md:max-w-none">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src="/img/rico-replacement.jpg"
              alt="404 Llama"
              className="object-cover rounded-3xl"
              width={364}
              height={364}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
