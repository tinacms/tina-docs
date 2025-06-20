import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

function ScrollShowcaseHeadingSection(data: {
  title: string;
  image: string;
  content: any;
  isFocused: boolean;
  sectionRef: (element: HTMLDivElement | null) => void;
}) {
  return (
    <div className="my-4" ref={data.sectionRef}>
      <h2
        className={`mb-3 mt-4 text-3xl transition-colors duration-500 ease-in-out ${
          data.isFocused
            ? "brand-primary-gradient"
            : "text-neutral-text-secondary"
        }`}
      >
        {data.title}
      </h2>
      <ul
        className={`list-none transition-colors duration-500 ease-in-out ${
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
  isFocused: boolean;
  sectionRef: (element: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={data.sectionRef}>
      <ul
        className={`list-none border-l-2 pl-4 transition-colors duration-500 ease-in-out ${
          data.isFocused ? "border-brand-primary" : "border-neutral-text"
        }`}
      >
        <li className="py-2">
          <div
            className={`text-xl font-medium transition-colors duration-500 ease-in-out ${
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

function ProgressBar(data: {
  progress: number;
  itemCount: number;
}) {
  const progressPercentage =
    (data.progress / Math.max(data.itemCount - 1, 1)) * 100;

  return (
    <div className="absolute top-0 right-8 z-50 h-full w-2 bg-neutral-background-secondary overflow-hidden">
      <div className="w-full h-full bg-neutral-text/20 relative">
        <div
          className="bg-brand-primary transition-all duration-300 ease-out w-full"
          style={{ height: `${progressPercentage}%` }}
        />
      </div>
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  const itemsLength = data.showcaseItems?.length ?? 0;

  // Set up intersection observer to track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -20% 0px", // Trigger when section is 20% into viewport
      threshold: 0.5,
    };

    for (let index = 0; index < elementsRef.current.length; index++) {
      const element = elementsRef.current[index];
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setFocusedIndex(index);
            }
          }
        }, observerOptions);

        observer.observe(element);
        observers.push(observer);
      }
    }

    // Cleanup observers on unmount
    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, []);

  const setElementRef = useCallback(
    (index: number) => (element: HTMLDivElement | null) => {
      if (element) {
        elementsRef.current[index] = element;
      }
    },
    []
  );

  return (
    <div className="relative">
      <ProgressBar
        progress={focusedIndex}
        itemCount={data.showcaseItems.length}
      />
      {data.showcaseItems.map((item, index) => {
        return item.useAsSubsection ? (
          <ScrollShowcaseSubsection
            key={index}
            {...item}
            isFocused={focusedIndex === index}
            sectionRef={setElementRef(index)}
          />
        ) : (
          <ScrollShowcaseHeadingSection
            key={index}
            {...item}
            isFocused={focusedIndex === index}
            sectionRef={setElementRef(index)}
          />
        );
      })}
    </div>
  );
}
