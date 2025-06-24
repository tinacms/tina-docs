import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

// Register the Observer plugin
gsap.registerPlugin(Observer);

function ScrollShowcaseHeadingSection(data: {
  title: string;
  image: string;
  content: any;
  isFocused: boolean;
}) {
  return (
    <div
      className={`my-4 transition-opacity duration-200 ease-in-out ${
        data.isFocused ? "opacity-100" : "opacity-30"
      }`}
    >
      <h2
        className={`mb-3 text-3xl font-medium transition-colors duration-200 ease-in-out ${
          data.isFocused ? "text-brand-primary" : "text-neutral-text"
        }`}
      >
        {data.title}
      </h2>
      <ul
        className={`list-none transition-colors duration-200 ease-in-out ${
          data.isFocused ? "border-brand-primary" : "border-neutral-text"
        }`}
      >
        <li>
          <TinaMarkdown content={data.content} />
        </li>
      </ul>
    </div>
  );
}

function ScrollShowcaseSubsection(data: {
  title: string;
  content: any;
  image: string;
  isFocused: boolean;
  direction?: number; // 1 for down, -1 for up
}) {
  const borderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!borderRef.current || !containerRef.current) return;

    if (data.isFocused) {
      // Animate border sliding in based on scroll direction
      const slideFromTop = (data.direction || 1) > 0;
      gsap.fromTo(
        borderRef.current,
        {
          scaleY: 0,
          transformOrigin: slideFromTop ? "top" : "bottom",
        },
        {
          scaleY: 1,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    } else {
      // Animate border sliding out opposite to entry direction
      const slideToBottom = (data.direction || 1) > 0;
      gsap.to(borderRef.current, {
        scaleY: 0,
        transformOrigin: slideToBottom ? "bottom" : "top",
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [data.isFocused, data.direction]);

  return (
    <div
      ref={containerRef}
      className={`relative transition-opacity duration-200 ease-in-out ${
        data.isFocused ? "opacity-100" : "opacity-30"
      }`}
    >
      {/* Animated border */}
      <div
        ref={borderRef}
        className="absolute left-0 top-0 w-0.5 h-full bg-brand-primary"
        style={{ transformOrigin: "top" }}
      />

      {/* Static border for fallback */}
      <div
        className={`absolute left-0 top-0 w-0.5 h-full transition-colors duration-200 ease-in-out ${
          data.isFocused ? "bg-transparent" : "bg-neutral-text"
        }`}
      />

      <ul className="list-none pl-4">
        <li className="py-2">
          <div
            className={`text-xl transition-colors duration-200 ease-in-out ${
              data.isFocused ? "text-brand-primary" : "text-neutral-text"
            }`}
          >
            {data.title}
          </div>
          <TinaMarkdown content={data.content} />
        </li>
      </ul>
    </div>
  );
}

/** Main Component */
export function ScrollBasedShowcase(data: {
  showcaseItems: {
    title: string;
    image: string;
    content: any;
    useAsSubsection?: boolean;
  }[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [scrollDirection, setScrollDirection] = useState(1); // 1 for down, -1 for up
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<any>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLDivElement[]>([]);

  // Wrap function to keep index within bounds
  const wrap = useCallback(
    (index: number) => {
      if (index < 0) return data.showcaseItems.length - 1;
      if (index >= data.showcaseItems.length) return 0;
      return index;
    },
    [data.showcaseItems.length]
  );

  // Function to go to a specific section
  const gotoSection = useCallback(
    (index: number, direction: number) => {
      const newIndex = wrap(index);
      setAnimating(true);
      setScrollDirection(direction);

      // Smooth transition with a timeout to simulate animation
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setAnimating(false);
      }, 300);
    },
    [wrap]
  );

  useEffect(() => {
    if (!containerRef.current || data.showcaseItems.length === 0) return;

    // Create GSAP Observer
    observerRef.current = Observer.create({
      target: containerRef.current,
      type: "wheel,touch,scroll",
      wheelSpeed: -4,
      onDown: () => !animating && gotoSection(currentIndex - 1, -1),
      onUp: () => !animating && gotoSection(currentIndex + 1, 1),
      tolerance: 2000,
      preventDefault: true,
    });

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.kill();
      }
    };
  }, [currentIndex, animating, data.showcaseItems.length, gotoSection]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (animating) return;

      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          event.preventDefault();
          gotoSection(currentIndex + 1, 1);
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          gotoSection(currentIndex - 1, -1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, animating, gotoSection]);

  // Animate image wrapper with bounce effect
  useEffect(() => {
    if (!imageWrapperRef.current) return;
    const sectionOffset = sectionRefs.current[currentIndex].offsetTop;
    const sectionHeight = sectionRefs.current[currentIndex].offsetHeight;
    const imageHeight = imageWrapperRef.current.offsetHeight;
    const containerHeight = containerRef.current?.offsetHeight || 0;
    let offset = sectionOffset + sectionHeight / 4 - imageHeight / 4;
    if (offset < 0) {
      offset = 0;
    }
    if (offset + imageHeight > containerHeight) {
      offset = containerHeight - imageHeight;
    }

    gsap.to(imageWrapperRef.current, {
      top: offset, // Adjusted spacing for better visual effect
      duration: 0.7,
      ease: "back.inOut(1.5)", // Bouncy animation
    });
  }, [currentIndex]);

  return (
    <div ref={containerRef} className="relative pb-12">
      <div className="md:flex flex-col">
        {data.showcaseItems.map((item, index) => (
          <div
            ref={(el) => {
              if (el) sectionRefs.current[index] = el;
            }}
            key={`${item.title}-${index}`}
            onClick={() =>
              !animating && gotoSection(index, index > currentIndex ? 1 : -1)
            }
            className="cursor-pointer lg:max-w-[48%]"
          >
            {item.useAsSubsection ? (
              <ScrollShowcaseSubsection
                {...item}
                isFocused={currentIndex === index}
                direction={scrollDirection}
              />
            ) : (
              <ScrollShowcaseHeadingSection
                {...item}
                isFocused={currentIndex === index}
              />
            )}
          </div>
        ))}
        <div
          ref={imageWrapperRef}
          className="absolute right-0 pb-12 lg:max-w-[48%]"
          style={{ top: 0 }}
        >
          <div className="bg-brand-primary/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-brand-primary/20">
            <Image
              className="rounded-lg"
              src={data.showcaseItems[currentIndex].image}
              alt={data.showcaseItems[currentIndex].title}
              width={300}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Navigation indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-50">
        {data.showcaseItems.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() =>
              !animating && gotoSection(index, index > currentIndex ? 1 : -1)
            }
            className={`h-0.5 transition-all duration-300 ${
              currentIndex === index
                ? "w-8 bg-brand-primary"
                : "w-4 bg-neutral-text/30 hover:bg-neutral-text/50"
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
