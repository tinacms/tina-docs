import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import {
  type Item,
  createListener,
  useWindowSize,
} from "./scroll-showcase.helpers";

/** Main Component */
export function ScrollBasedShowcase(data: {
  showcaseItems: {
    title: string;
    image: string;
    content: any;
    useAsSubsection?: boolean;
  }[];
}) {
  const [headings, setHeadings] = useState<Item[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [activeImageSrc, setActiveImageSrc] = useState<string>("");

  const windowSize = useWindowSize();

  /** Build headings array on mount */
  useEffect(() => {
    const tempHeadings: Item[] = [];
    data.showcaseItems?.forEach((item, index) => {
      const headingData: Item = {
        id: `${item.title}-${index}`,
        level: item.useAsSubsection ? "H3" : "H2",
        src: item.image,
        offset: headingRefs.current[index]?.offsetTop ?? 0,
      };
      tempHeadings.push(headingData);
    });
    setHeadings(tempHeadings);

    // Set initial active image
    if (tempHeadings.length > 0 && tempHeadings[0].src) {
      setActiveImageSrc(tempHeadings[0].src);
    }
  }, [data.showcaseItems]);

  /** Update heading offsets on resize */
  useEffect(() => {
    const updateOffsets = () => {
      const updatedHeadings = headings.map((heading, index) => ({
        ...heading,
        offset: headingRefs.current[index]?.offsetTop ?? 0,
      }));
      setHeadings(updatedHeadings);
    };
    window.addEventListener("resize", updateOffsets);
    return () => window.removeEventListener("resize", updateOffsets);
  }, [headings]);

  /** Throttled scroll event */
  useEffect(() => {
    if (typeof window === "undefined" || !componentRef.current) return;
    const activeTocListener = createListener(
      componentRef as React.RefObject<HTMLDivElement>,
      headings,
      setActiveIds
    );
    window.addEventListener("scroll", activeTocListener);
    return () => window.removeEventListener("scroll", activeTocListener);
  }, [headings]);

  /** Update active image when activeIds change */
  useEffect(() => {
    if (!activeIds.length) return;
    const heading = headings.find((h) => h.id === activeIds[0]);
    if (heading?.src) {
      setActiveImageSrc(heading.src);
    }
  }, [activeIds, headings]);

  return (
    <div
      ref={componentRef}
      // doc-container replacements:
      className="relative mx-auto my-5 block w-full"
    >
      <div className="relative flex ">
        <div
          id="main-content-container"
          className="m-2 box-border flex min-h-full gap-20 flex-1 flex-col justify-between px-2 pb-16 pt-8"
        >
          {data.showcaseItems?.map((item, index) => {
            const itemId = `${item.title}-${index}`;
            const isFocused = activeIds.includes(itemId);

            return (
              <div
                key={`showcase-item-${index}`}
                // If active => full opacity + orange border + text colors
                // If not => half opacity + gray border
                className={`mt-0 transition-all duration-300 ease-in-out md:mt-8
                  ${
                    isFocused
                      ? "text-neutral-text  opacity-100"
                      : "border-neutral-border  text-neutral-text-secondary opacity-15"
                  }
                `}
              >
                {item.useAsSubsection ? (
                  <div
                    id={itemId}
                    className="pointer-events-none"
                    ref={(element) => {
                      headingRefs.current[index] = element;
                    }}
                  >
                    <div
                      className={`my-2 bg-gradient-to-br bg-clip-text text-xl font-medium text-transparent ${
                        isFocused
                          ? "from-orange-400 via-orange-500 to-orange-600"
                          : "from-gray-800 to-gray-700"
                      } !important`}
                    >
                      {item.title}
                    </div>
                  </div>
                ) : (
                  <div
                    id={itemId}
                    className="pointer-events-none"
                    ref={(element) => {
                      headingRefs.current[index] = element;
                    }}
                  >
                    <h2
                      className={`mb-3  mt-4  text-3xl ${
                        isFocused
                          ? "brand-primary-gradient"
                          : "text-neutral-text-secondary"
                      }`}
                    >
                      {item.title}
                    </h2>
                  </div>
                )}

                <ul
                  className={`list-none border-l-4 pl-4 transition-colors duration-500 ease-in-out ${
                    isFocused
                      ? "border-brand-primary"
                      : "border-neutral-text-secondary"
                  }`}
                >
                  <li>
                    <TinaMarkdown content={item.content} />
                  </li>
                </ul>

                {/* This image is only shown on mobile (md:hidden).
                    On larger screens, the separate container is used. */}
                {item.image && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${
                      item.image
                    }`}
                    alt={item.title}
                    width={500}
                    height={300}
                    className="my-8 block md:hidden"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* This image container is only displayed on md+ */}
        <div className="relative hidden w-full flex-1 overflow-hidden md:block">
          {activeImageSrc && (
            <Image
              src={`${
                process.env.NEXT_PUBLIC_BASE_PATH || ""
              }${activeImageSrc}`}
              alt=""
              width={500}
              height={300}
              className="w-100 absolute right-0 rounded-lg transition-all duration-1000 ease-in-out"
              style={{
                opacity: activeIds.length ? 1 : 0,
                top:
                  (headings.find((h) => h.id && activeIds.includes(h.id))
                    ?.offset || 0) + 100,
                transform: "translateY(-50%)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
