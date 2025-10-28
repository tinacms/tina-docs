import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { ImageOverlayWrapper } from "../../ui/image-overlay-wrapper";
import MarkdownComponentMapping from "../markdown-component-mapping";

interface AccordionProps {
  docText: string;
  image: string;
  heading?: string;
  fullWidth?: boolean;
}

const Accordion = (props) => {
  const { docText, image, heading, fullWidth = true }: AccordionProps = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Header */}
      <div
        className={`mb-5 max-w-full overflow-hidden rounded-lg bg-neutral-background shadow-md transition-[width] duration-700 ease-in-out border border-neutral-border ${
          fullWidth ? "w-full" : "w-3/4"
        }`}
        data-tina-field={tinaField(props, "heading")}
      >
        <div
          className="flex cursor-pointer items-center justify-between px-6 py-6"
          onClick={toggleExpand}
        >
          <h4 className="text-neutral-text text-base font-heading mt-0.5">
            {heading || "Click to expand"}
          </h4>
          <div>
            {isExpanded ? (
              <MinusIcon className="size-5 text-neutral-text" />
            ) : (
              <PlusIcon className="size-5 text-neutral-text" />
            )}
          </div>
        </div>
        {/* Expandable content */}
        <div
          className={`grid gap-4  transition-all duration-700 ease-in-out ${
            isExpanded
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          } ${image ? "sm:grid-cols-2" : ""}`}
          ref={contentRef}
          data-tina-field={tinaField(props, "docText")}
        >
          <div className="p-4">
            <TinaMarkdown
              content={docText as any}
              components={MarkdownComponentMapping}
            />
          </div>
          {image && (
            <div className="p-4" data-tina-field={tinaField(props, "image")}>
              <ImageOverlayWrapper src={image} alt="image" caption={heading}>
                <Image
                  src={
                    image.startsWith("http")
                      ? image
                      : `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${image}`
                  }
                  alt="image"
                  className="rounded-lg"
                  width={500}
                  height={500}
                />
              </ImageOverlayWrapper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accordion;

interface AccordionBlockProps {
  fullWidth?: boolean;
  accordionItems: {
    docText: string;
    image: string;
    heading?: string;
    fullWidth?: boolean;
  }[];
}

export const AccordionBlock = (props) => {
  const { accordionItems, fullWidth = false }: AccordionBlockProps = props;
  const [isExpanded, setIsExpanded] = useState<boolean[]>(
    accordionItems?.map(() => false) || []
  );
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [accordionLength, setAccordionLength] = useState(
    accordionItems?.length || 0
  );

  useEffect(() => {
    setAccordionLength(accordionItems?.length || 0);
    setIsExpanded((prev) => {
      // Keep existing expanded states for items that still exist
      // and initialize new ones as false
      const newExpanded =
        accordionItems?.map((_, i) => (i < prev.length ? prev[i] : false)) ||
        [];
      return newExpanded;
    });
  }, [accordionItems]);

  const toggleExpand = (index: number) => {
    setIsExpanded((prev) => {
      const newIsExpanded = [...prev];
      newIsExpanded[index] = !newIsExpanded[index];
      return newIsExpanded;
    });
  };

  // If accordionItems is undefined or empty, return empty div or loading state
  if (!accordionItems || accordionItems.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center rounded-lg bg-white/40 shadow-lg mb-5 p-4 border border-neutral-border">
        No accordion items
      </div>
    );
  }

  return (
    <div
      className={`mx-auto flex flex-col justify-center items-center rounded-lg bg-neutral-background shadow-md mb-5 border border-neutral-border ${
        fullWidth ? "w-full" : "w-3/4"
      }`}
    >
      {accordionItems.map((item, index) => (
        <div key={index} className="w-full">
          <div
            className="flex cursor-pointer items-center justify-between px-6 py-6"
            onClick={() => toggleExpand(index)}
            data-tina-field={tinaField(props.accordionItems[index], "heading")}
          >
            <h4 className="text-neutral-text text-base font-heading mt-0.5">
              {item.heading || "Click to expand"}
            </h4>
            <div>
              {isExpanded[index] ? (
                <MinusIcon className="size-5 text-neutral-text" />
              ) : (
                <PlusIcon className="size-5 text-neutral-text" />
              )}
            </div>
          </div>
          <div
            className={`grid gap-4 transition-all duration-700 ease-in-out ${
              isExpanded[index]
                ? "max-h-[2000px] opacity-100"
                : "max-h-0 overflow-hidden opacity-0"
            } ${item.image ? "sm:grid-cols-2" : ""}`}
            ref={(el: HTMLDivElement | null) => {
              contentRefs.current[index] = el;
            }}
            data-tina-field={tinaField(props.accordionItems[index], "docText")}
          >
            <div
              className="px-4"
              data-tina-field={tinaField(
                props.accordionItems[index],
                "docText"
              )}
            >
              <TinaMarkdown
                content={item.docText as any}
                components={MarkdownComponentMapping}
              />
            </div>
            {item.image && (
              <div
                className="p-4"
                data-tina-field={tinaField(
                  props.accordionItems[index],
                  "image"
                )}
              >
                <ImageOverlayWrapper
                  src={item.image}
                  alt="image"
                  caption={item?.heading}
                >
                  <Image
                    src={
                      item.image.startsWith("http")
                        ? item.image
                        : `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${item.image}`
                    }
                    alt="image"
                    className="rounded-lg"
                    width={500}
                    height={500}
                  />
                </ImageOverlayWrapper>
              </div>
            )}
          </div>
          {index < accordionLength - 1 && (
            <hr className="w-full h-0.5 text-neutral-border/50" />
          )}
        </div>
      ))}
    </div>
  );
};
