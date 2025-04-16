import type React from "react";
import { useEffect, useRef, useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Image from "next/image";

/** Minimal inline docAndBlogComponents for headings only */
const docAndBlogComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
};

/** UseWindowSize Hook */
function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/** Throttled scroll listener */
function createListener(
  componentRef: React.RefObject<HTMLDivElement>,
  headings: Item[],
  // Callback to update active IDs - param name in type is just for documentation

  setActiveIds: (activeIds: string[]) => void,
) {
  let tick = false;
  const THROTTLE_INTERVAL = 100;
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

  const maxScrollYRelative =
    (maxScrollY - componentRef.current.offsetTop) /
    componentRef.current.scrollHeight;

  const relativePositionHeadingMap = headings.map((heading) => {
    const relativePosition =
      1 -
      (componentRef.current.scrollHeight - (heading.offset || 0)) /
        componentRef.current.scrollHeight;

    return {
      ...heading,
      relativePagePosition:
        maxScrollYRelative > 1
          ? relativePosition
          : relativePosition * maxScrollYRelative,
    };
  });

  const throttledScroll = () => {
    if (!componentRef.current) return;
    const scrollPos =
      window.scrollY - componentRef.current.offsetTop + window.innerHeight / 6;
    const newActiveIds: string[] = [];
    const relativeScrollPosition =
      scrollPos / componentRef.current.scrollHeight;

    const activeHeadingCandidates = relativePositionHeadingMap.filter(
      (heading) => relativeScrollPosition >= heading.relativePagePosition,
    );

    const activeHeading =
      activeHeadingCandidates.length > 0
        ? activeHeadingCandidates.reduce((prev, current) =>
            (prev.offset || 0) > (current.offset || 0) ? prev : current,
          )
        : (headings[0] ?? {});

    newActiveIds.push(activeHeading.id || "");

    if (activeHeading.level !== "H2") {
      const activeHeadingParentCandidates =
        activeHeadingCandidates.length > 0
          ? activeHeadingCandidates.filter((h) => h.level === "H2")
          : [];
      const activeHeadingParent =
        activeHeadingParentCandidates.length > 0
          ? activeHeadingParentCandidates.reduce((prev, current) =>
              (prev.offset || 0) > (current.offset || 0) ? prev : current,
            )
          : null;

      if (activeHeadingParent?.id) {
        newActiveIds.push(activeHeadingParent.id);
      }
    }
    setActiveIds(newActiveIds);
  };

  return function onScroll() {
    if (!tick) {
      setTimeout(() => {
        throttledScroll();
        tick = false;
      }, THROTTLE_INTERVAL);
    }
    tick = true;
  };
}

interface Item {
  id?: string;
  offset?: number;
  level?: string;
  src?: string;
}

/** Main Component */
export default function ScrollBasedShowcase(data: {
  showcaseItems: {
    title: string;
    image: string;
    content: any;
    useAsSubsection?: boolean;
  }[];
}) {
  const [headings, setHeadings] = useState<Item[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const activeImg = useRef<HTMLImageElement>(null);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);

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
    if (typeof window === "undefined") return;
    const activeTocListener = createListener(
      componentRef,
      headings,
      setActiveIds,
    );
    window.addEventListener("scroll", activeTocListener);
    return () => window.removeEventListener("scroll", activeTocListener);
  }, [headings, windowSize]);

  /** Update active image when activeIds change */
  useEffect(() => {
    if (!activeIds.length) return;
    const heading = headings.find((h) => h.id === activeIds[0]);
    if (activeImg.current) {
      activeImg.current.src = heading?.src || "";
    }
  }, [activeIds, headings]);

  return (
    <div
      ref={componentRef}
      // doc-container replacements:
      className="relative mx-auto my-5 block w-full"
    >
      <div className="relative flex min-h-screen">
        <div
          id="main-content-container"
          className="m-2 box-border flex min-h-full flex-1 flex-col justify-between px-2 pb-16 pt-8"
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
                      ? "text-gray-900  opacity-100"
                      : "border-gray-300  text-gray-800 opacity-15"
                  }
                `}
              >
                {item.useAsSubsection ? (
                  <div
                    id={itemId}
                    className="pointer-events-none"
                    ref={(el) => (headingRefs.current[index] = el)}
                  >
                    <div
                      // eslint-disable-next-line tailwindcss/no-custom-classname
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
                    ref={(el) => (headingRefs.current[index] = el)}
                  >
                    <h2
                      className={`mb-3  mt-4 bg-gradient-to-br bg-clip-text text-3xl text-transparent ${
                        isFocused
                          ? "from-orange-400 via-orange-500 to-orange-600"
                          : "from-gray-800 to-gray-700"
                      }`}
                    >
                      {item.title}
                    </h2>
                  </div>
                )}

                <ul
                  className={`list-none border-l-4 pl-4 transition-colors duration-500 ease-in-out ${
                    isFocused ? "border-orange-400" : "border-gray-800"
                  }`}
                >
                  <li>
                    <TinaMarkdown
                      content={item.content}
                      components={docAndBlogComponents}
                    />
                  </li>
                </ul>

                {/* This image is only shown on mobile (md:hidden).
                    On larger screens, the separate container is used. */}
                {item.image && (
                  <Image
                    src={item.image}
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
          {headings[0]?.src && (
            <Image
              ref={activeImg}
              src={headings[0].src}
              alt=""
              width={500}
              height={300}
              // eslint-disable-next-line tailwindcss/no-custom-classname
              className="w-100 absolute right-0 rounded-lg transition-all duration-1000 ease-in-out"
              style={{
                opacity: activeIds.length ? 1 : 0,
                bottom: Math.max(
                  (componentRef.current?.scrollHeight || 0) -
                    (headings.filter((h) => activeIds.includes(h.id))[
                      activeIds.length - 1
                    ]?.offset || 0) -
                    (activeIds.includes(headings[0]?.id) &&
                    activeIds.length === 1
                      ? activeImg.current?.scrollHeight || 0
                      : (activeImg.current?.scrollHeight || 0) / 1.2) +
                    ((activeIds.length - 1) * 32 || 0),
                  0,
                ),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
