import type { ImageMetadata } from "@/tina/collections/image-metadata";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import AnimateHeight from "react-animate-height";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { ImageOverlayWrapper } from "../../ui/image-overlay-wrapper";
import MarkdownComponentMapping from "../markdown-component-mapping";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TRANSITION_DURATION = 700;

interface AccordionProps {
  docText: string;
  image: ImageMetadata;
  heading?: string;
  fullWidth?: boolean;
}

const Accordion = (props) => {
  const { docText, image, heading, fullWidth = true }: AccordionProps = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const imageData = image?.src ? image : null;

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Header */}
      <div
        className={`mb-5 max-w-full overflow-hidden rounded-lg bg-neutral-background shadow-md transition-[width] duration-700 ease-in-out border border-neutral-border ${
          fullWidth ? "w-full" : "w-full md:w-3/4"
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
        <AnimateHeight
          duration={TRANSITION_DURATION}
          height={isExpanded ? "auto" : 0}
          animateOpacity
          className="w-full min-w-0"
        >
          <div
            className={`grid w-full min-w-0 gap-4 grid-cols-1 ${
              imageData ? "sm:grid-cols-2" : ""
            }`}
            data-tina-field={tinaField(props, "docText")}
          >
            <div className="min-w-0 p-4">
              <TinaMarkdown
                content={docText as any}
                components={MarkdownComponentMapping}
              />
            </div>
            {imageData && (
              <div className="p-4" data-tina-field={tinaField(props, "image")}>
                <ImageOverlayWrapper
                  src={imageData.src}
                  alt={imageData.alt || heading || "image"}
                  caption={heading}
                >
                  <Image
                    src={`${basePath}${imageData.src}`}
                    alt={imageData.alt || heading || "image"}
                    className="rounded-lg"
                    {...(imageData.width && imageData.height
                      ? {
                          width: imageData.width,
                          height: imageData.height,
                          style: { width: "100%", height: "auto" },
                        }
                      : { width: 500, height: 500 })}
                  />
                </ImageOverlayWrapper>
              </div>
            )}
          </div>
        </AnimateHeight>
      </div>
    </div>
  );
};

export default Accordion;

interface AccordionBlockProps {
  fullWidth?: boolean;
  accordionItems: {
    docText: string;
    image: ImageMetadata;
    heading?: string;
    fullWidth?: boolean;
  }[];
}

export const AccordionBlock = (props) => {
  const { accordionItems, fullWidth = true }: AccordionBlockProps = props;
  const [isExpanded, setIsExpanded] = useState<boolean[]>(
    accordionItems?.map(() => false) || []
  );
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
        fullWidth ? "w-full" : "w-full md:w-3/4"
      }`}
    >
      {accordionItems.map((item, index) => {
        const imageData = item.image?.src ? item.image : null;

        return (
          <div key={index} className="w-full">
            <div
              className="flex cursor-pointer items-center justify-between px-6 py-6"
              onClick={() => toggleExpand(index)}
              data-tina-field={tinaField(
                props.accordionItems[index],
                "heading"
              )}
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
            <AnimateHeight
              duration={TRANSITION_DURATION}
              height={isExpanded[index] ? "auto" : 0}
              animateOpacity
              className="w-full min-w-0"
            >
              <div
                className={`grid w-full min-w-0 gap-4 grid-cols-1 ${
                  imageData ? "sm:grid-cols-2" : ""
                }`}
                data-tina-field={tinaField(
                  props.accordionItems[index],
                  "docText"
                )}
              >
                <div
                  className="min-w-0 px-4"
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
                {imageData && (
                  <div
                    className="p-4"
                    data-tina-field={tinaField(
                      props.accordionItems[index],
                      "image"
                    )}
                  >
                    <ImageOverlayWrapper
                      src={imageData.src}
                      alt={imageData.alt || item?.heading || "image"}
                      caption={item?.heading}
                    >
                      <Image
                        src={`${basePath}${imageData.src}`}
                        alt={imageData.alt || item?.heading || "image"}
                        className="rounded-lg"
                        {...(imageData.width && imageData.height
                          ? {
                              width: imageData.width,
                              height: imageData.height,
                              style: { width: "100%", height: "auto" },
                            }
                          : { width: 500, height: 500 })}
                      />
                    </ImageOverlayWrapper>
                  </div>
                )}
              </div>
            </AnimateHeight>
            {index < accordionLength - 1 && (
              <hr className="w-full h-0.5 text-neutral-border/50" />
            )}
          </div>
        );
      })}
    </div>
  );
};
