import {
  CheckIcon,
  ChevronRightIcon,
  ClipboardIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { BiRightArrowAlt } from "react-icons/bi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import { Components, TinaMarkdown } from "tinacms/dist/rich-text";
import { getDocId } from "../../utils/docs/getDocsIds";
import { CardGrid } from "../blocks/CardGrid";
import { GraphQLQueryResponseTabs } from "../docs/GraphQLTabs";
import { Prism } from "../styles/Prism";
import MermaidElement from "./mermaid";
import RecipeBlock from "./Recipe";
import ScrollBasedShowcase from "./scrollBasedShowcase";

// Casting fixes to address TS errors
const NextImage = Image as unknown as React.FC<any>;
const CheckIconComponent = CheckIcon as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ClipboardIconComponent = ClipboardIcon as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ChevronRightIconComponent = ChevronRightIcon as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const LightBulbIconComponent = LightBulbIcon as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ExclamationTriangleIconComponent =
  ExclamationTriangleIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const InformationCircleIconComponent =
  InformationCircleIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

export const DocsMDXComponentRenderer: Components<{
  Iframe: { iframeSrc: string; height: string };
  Youtube: { embedSrc: string; caption?: string; minutes?: string };
  CreateAppCta: { ctaText: string; cliText: string };
  GraphQLCodeBlock: {
    query: string;
    response: string;
    preselectResponse: boolean;
    customQueryName?: string;
    customResponseName?: string;
  };
  Callout: {
    title: string;
    description: string;
    url: string;
    buttonText: string;
  };
  ApiReference: {
    title: string;
    property: {
      groupName: string;
      name: string;
      description: string;
      type: string;
      default: string;
      required: boolean;
    }[];
  };
  WebmEmbed: { embedSrc: string; width?: string };
  WarningCallout: { body: string };
  Codesandbox: { embedSrc: string; title: string };
  Diagram: { alt: string; src: string };
  WideImage: { alt: string; src: string };
  CustomFieldComponentDemo: unknown;
  CloudinaryVideo: { src: string };
  Button: { link: string; label: string };
  ImageAndText: { docText: string; image: string; heading?: string };
  Summary: { heading: string; text: string };
  recipeBlock: {
    title?: string;
    description?: string;
    codeblock?: any;
    instruction?: {
      header?: string;
      itemDescription?: string;
      codeLineStart?: number;
      codeLineEnd?: number;
    }[];
  };
  scrollBasedShowcase: {
    showcaseItems: {
      image: string;
      title: string;
      useAsSubsection: boolean;
      content: string;
    }[];
  };
  cardGrid: {
    cards: {
      title: string;
      description: string;
      link: string;
      linkText: string;
    }[];
  };
  code_block: {
    value: string;
    lang: string;
    children: string;
  };
}> = {
  scrollBasedShowcase: (props) => {
    return <ScrollBasedShowcase showcaseItems={props.showcaseItems} />;
  },
  cardGrid: (props) => {
    return <CardGrid props={props} />;
  },
  recipeBlock: (props) => {
    return (
      <div className="text-white">
        <RecipeBlock data={props} />
      </div>
    );
  },
  ImageAndText: (props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div
        // eslint-disable-next-line tailwindcss/no-arbitrary-value
        className={`mb-2 max-w-full overflow-hidden rounded-lg bg-white/40 shadow-sm transition-[width] duration-300 ease-in-out ${
          isExpanded ? "w-full" : "w-80 delay-700"
        }`}
      >
        <div
          className="flex cursor-pointer items-center justify-between px-4 py-1"
          onClick={toggleExpand}
        >
          {FormatHeaders({
            children: props.heading || "Click to expand",
            level: 6,
          })}
          <div>
            {isExpanded ? (
              <FaMinus className="size-3 text-blue-800" />
            ) : (
              <FaPlus className="size-3 text-gray-500" />
            )}
          </div>
        </div>

        <div
          // eslint-disable-next-line tailwindcss/no-arbitrary-value
          className={`grid gap-4 border-t border-gray-100 transition-all duration-700 ease-in-out ${
            isExpanded
              ? "max-h-[2000px] opacity-100 delay-500"
              : "max-h-0 overflow-hidden opacity-0"
          } ${props?.image ? "sm:grid-cols-2" : ""}`}
          ref={contentRef}
        >
          <div className="p-4">
            <TinaMarkdown
              content={props.docText as any}
              components={DocsMDXComponentRenderer}
            />
          </div>
          {props?.image && (
            <div className="p-4">
              <NextImage
                src={props?.image}
                alt="image"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    );
  },
  code: (props) => (
    <code
      className="rounded border-y-stone-600 bg-white/50 px-1 py-0.5 text-orange-500"
      {...props}
    />
  ),

  Summary: (props) => {
    const [openTab, setOpenTab] = useState(false);

    const handleToggle = () => {
      setOpenTab(!openTab);
    };

    return (
      <div>
        <hr></hr>
        <button
          className="flex w-full items-start justify-between text-left text-gray-900"
          onClick={handleToggle}
        >
          <h3>{props.heading}</h3>
          {openTab ? <FaMinus /> : <FaPlus />}
        </button>
        {openTab && (
          <div>
            <TinaMarkdown
              content={props.text as any}
              components={DocsMDXComponentRenderer}
            />
          </div>
        )}
      </div>
    );
  },
  h1: (props) => <FormatHeaders level={1} {...props} />,
  h2: (props) => <FormatHeaders level={2} {...props} />,
  h3: (props) => <FormatHeaders level={3} {...props} />,
  h4: (props) => <FormatHeaders level={5} {...props} />,
  h5: (props) => <FormatHeaders level={5} {...props} />,
  h6: (props) => <FormatHeaders level={6} {...props} />,
  img: (props) => {
    const ImageComponent = () => {
      const [dimensions, setDimensions] = useState({ width: 16, height: 9 });
      const [isLoading, setIsLoading] = useState(true);

      const handleImageLoad = (img: HTMLImageElement) => {
        if (img) {
          setDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          setIsLoading(false);
        }
      };

      return (
        <span className="my-4 flex flex-col gap-2">
          <span className="relative mx-auto w-full max-w-xl">
            <span
              className="relative overflow-hidden rounded-xl"
              style={{
                aspectRatio: `${dimensions.width}/${dimensions.height}`,
                maxHeight: "600px",
                minHeight: "200px",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
              }}
            >
              <NextImage
                src={props?.url || ""}
                alt={props?.alt || ""}
                title={props?.caption || ""}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                style={{ objectFit: "contain" }}
                onLoad={handleImageLoad}
                priority
              />
            </span>
          </span>
          {props?.caption && (
            <span className="font-tuner text-sm text-gray-500">
              Figure: {props.caption}
            </span>
          )}
        </span>
      );
    };

    return <ImageComponent />;
  },
  ul: (props) => <ul className="my-4 ml-2 list-disc" {...props} />,
  ol: (props) => <ol className="my-4 ml-2 list-decimal" {...props} />,
  li: (props) => <li className="mb-2 ml-8" {...props} />,
  p: (props) => <p className="mb-2" {...props} />,
  a: (props) => {
    return (
      <a
        href={props?.url}
        {...props}
        className="underline opacity-80 transition-all duration-200 ease-out hover:text-orange-500"
      />
      //Ripped the styling from styles/RichText.tsx " a:not([class]) "
    );
  },
  block_quote: (props) => (
    <blockquote
      style={{
        backgroundColor: "var(--color-white)",
      }}
      className="relative !my-6 overflow-hidden rounded-r-lg border-l-4 border-x-teal-400 pb-4 pl-3 pr-2 pt-2 md:py-6"
    >
      <div className="flex flex-col items-start md:flex-row md:items-center md:gap-2">
        <div className="shrink-0">
          <LightBulbIconComponent
            size={40}
            className="from-seafoam-500 to-seafoam-700 mx-0 my-2 rounded-full bg-gradient-to-br p-2 text-white md:mx-2 md:my-0"
          />
        </div>
        <div className="leading-6">
          <TinaMarkdown
            content={props?.children?.props?.content as any}
            components={DocsMDXComponentRenderer}
          />
        </div>
      </div>
    </blockquote>
  ),
  mermaid: (value) => {
    return <MermaidElement value={value?.value} />;
  },
  Iframe: ({ iframeSrc, height }) => {
    return (
      <div>
        <iframe width="100%" height={`${height}px`} src={iframeSrc} />
      </div>
    );
  },
  ApiReference: (props) => {
    const [openGroups, setOpenGroups] = useState([]);
    const propertyItem = (property) => {
      return (
        <div className="space-y-4 px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="w-full md:w-1/3">
              <div className="mb-1">
                {property.required && (
                  <span className="text-sm font-medium text-orange-500">
                    REQUIRED
                  </span>
                )}
                {property.experimental && (
                  <span className="text-seafoam-700 text-sm font-medium">
                    EXPERIMENTAL
                  </span>
                )}
              </div>
              <div className="inline-block max-w-full break-normal font-tuner font-medium text-blue-500">
                {property?.name?.replace(/([A-Z])/g, "\u200B$1")}
              </div>
              <div className="text-sm text-gray-500">{property.type}</div>
            </div>
            <div className="w-full md:w-2/3">
              <TinaMarkdown
                content={property.description as any}
                components={DocsMDXComponentRenderer}
              />
              {property.default && (
                <div className="text-md text-slate-900">
                  Default is{" "}
                  <span className="font-mono text-orange-500">
                    {property.default}
                  </span>
                  .
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    const group = (groupName, groupProperties) => {
      const required = groupProperties.some((property) => property.required);

      return (
        <div className=" group my-4 overflow-hidden">
          <button
            onClick={() =>
              setOpenGroups(
                openGroups.includes(groupName)
                  ? openGroups.filter((group) => group !== groupName)
                  : [...openGroups, groupName],
              )
            }
            className="flex w-full items-center justify-between bg-transparent bg-gradient-to-b from-blue-100/20 to-blue-50/20 px-6 py-4 text-left transition-colors hover:bg-blue-200/10"
          >
            <div>
              {required && (
                <p className="text-sm font-medium text-orange-500">REQUIRED</p>
              )}
              <h3 className="text-md font-tuner font-medium text-blue-500">
                {groupName || "Object"}
              </h3>
            </div>

            <ChevronRightIconComponent
              className={`size-5 text-blue-200 transition-transform ${
                openGroups.includes(groupName) ? "rotate-90" : ""
              } group-hover:text-blue-500`}
            />
          </button>
          {openGroups.includes(groupName) && (
            <div className="px-4">
              {groupProperties.map((property, index) => {
                return (
                  <div key={`property-${index}`}>
                    {index !== 0 && (
                      <hr className="m-auto -my-0.5 h-0.5 w-4/5 rounded-lg bg-gray-200" />
                    )}
                    <div className="mx-2 border-l-2 border-solid border-orange-400">
                      <React.Fragment>{propertyItem(property)}</React.Fragment>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        className={`my-6 rounded-lg bg-white pb-6 shadow-lg ${
          props.title ? "pt-6" : "pt-2"
        }`}
      >
        {props.title && (
          <h2 className="mb-6 text-3xl text-blue-600">{props.title}</h2>
        )}

        {/* Process properties in order, grouping only adjacent items with same groupName */}
        {(() => {
          if (!props.property?.length) return null;

          const result: any[] = [];
          let currentGroup: string | null = null;
          let currentGroupProperties: any[] = [];

          // Process each property in original order
          props.property.forEach((property, index) => {
            // If property has no groupName, render it individually
            if (!property.groupName) {
              // If we were building a group, finalize it
              if (currentGroup) {
                result.push(
                  <React.Fragment key={`group-${result.length}`}>
                    {group(currentGroup, currentGroupProperties)}
                  </React.Fragment>,
                );
                currentGroup = null;
                currentGroupProperties = [];
              } else {
                if (index !== 0) {
                  result.push(
                    <hr className="m-auto h-0.5 w-4/5 rounded-lg bg-gray-200" />,
                  );
                }
              }

              // Add the individual property
              result.push(
                <React.Fragment key={`ind-${index}`}>
                  {propertyItem(property)}
                </React.Fragment>,
              );
            }
            // If property has a groupName
            else {
              // If it's the same group as we're currently building, add to it
              if (currentGroup === property.groupName) {
                currentGroupProperties.push(property);
              }
              // If it's a different group or first group
              else {
                // Finalize previous group if it exists
                if (currentGroup) {
                  result.push(
                    <React.Fragment key={`group-${result.length}`}>
                      {group(currentGroup, currentGroupProperties)}
                    </React.Fragment>,
                  );
                }

                // Start a new group
                currentGroup = property.groupName;
                currentGroupProperties = [property];
              }
            }
          });

          // Don't forget to add the last group if we were building one
          if (currentGroup) {
            result.push(
              <React.Fragment key={`group-${result.length}`}>
                {group(currentGroup, currentGroupProperties)}
              </React.Fragment>,
            );
          }

          return result;
        })()}

        {props.property?.some((property) => property.required) && (
          <div className=" mx-6 mt-6 flex items-start gap-3 rounded-md bg-blue-50 p-4">
            {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
            <InformationCircleIconComponent className="mt-0.5 size-5 shrink-0 text-[#3B82F6]" />
            <p className="text-sm text-gray-700">
              All properties marked as{" "}
              {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
              <span className="font-medium text-[#FF5533]">REQUIRED</span> must
              be specified for the field to work properly.
            </p>
          </div>
        )}
      </div>
    );
  },
  table: (props) => {
    // Navigate through the nested structure to find the actual table content
    // @ts-ignore
    const tableRows = props?.children?.props?.children || [];

    return (
      <div className="my-6 overflow-x-auto rounded-lg shadow-md">
        <table className="w-full table-auto">
          <tbody>
            {tableRows.map((row, rowIndex) => {
              // Each row has its own props.children array containing cells
              const cells = row?.props?.children || [];
              const CellComponent = rowIndex === 0 ? "th" : "td";

              return (
                <tr
                  key={`row-${rowIndex}`}
                  className={
                    rowIndex % 2 === 0 ? "bg-white/5" : "bg-blue-500/5"
                  }
                >
                  {cells.map((cell, cellIndex) => {
                    return (
                      <CellComponent
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={`border border-orange-100 px-4 py-2 ${
                          rowIndex === 0
                            ? "bg-white/50 text-left font-tuner font-normal text-orange-500"
                            : ""
                        } ${cellIndex === 0 ? "max-w-xs break-words" : ""}`}
                      >
                        {cell?.props?.children}
                        <TinaMarkdown
                          content={cell?.props?.content as any}
                          components={DocsMDXComponentRenderer}
                        />
                      </CellComponent>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
  WebmEmbed: ({ embedSrc, width = "100%" }) => (
    <div className="video-container my-4 flex justify-center">
      <video
        width={width}
        height="auto"
        src={embedSrc}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={embedSrc} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  ),
  Youtube: ({ embedSrc, caption, minutes }) => (
    <div className="my-6 flex flex-col gap-2">
      <div className="relative aspect-video w-full">
        <iframe
          className="absolute left-0 top-0 size-full rounded-xl"
          src={embedSrc}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        ></iframe>
      </div>
      {caption && (
        <div className="font-tuner text-sm text-gray-500">
          Video: {caption} {minutes && `(${minutes} minutes)`}
        </div>
      )}
    </div>
  ),

  CreateAppCta: ({ ctaText, cliText }) => (
    <>
      <a
        href="/docs/introduction/using-starter/"
        style={{
          textDecoration: "none",
          borderRadius: "10px",
          padding: "1rem 1.5rem",
          lineHeight: "1em",
          fontWeight: "bold",
          background: "#ec4815",
          display: "inline-block",
          color: "white",
        }}
      >
        {ctaText}
      </a>

      <div
        style={{
          padding: "1rem 1.5rem",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          width: "auto",
          display: "inline-block",
          border: "1px solid #8080803b",
          lineHeight: "1em",
          borderRadius: "10px",
          marginLeft: "20px",
          fontSize: "1rem",
        }}
      >
        {cliText}
      </div>
    </>
  ),
  WarningCallout: ({ body }) => (
    <blockquote
      style={{
        backgroundColor: "var(--color-white)",
      }}
      className="relative my-4 overflow-hidden rounded-r-lg border-l-4 border-x-orange-400 pb-4 pl-4 pr-2 pt-2 md:py-6"
    >
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
        <div>
          <ExclamationTriangleIconComponent
            size={40}
            className="mx-0 my-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 px-2 pb-1.5 pt-0.5 text-white md:mx-2 md:my-0"
          />
        </div>
        <div className="leading-6">
          <TinaMarkdown
            content={body as any}
            components={DocsMDXComponentRenderer}
          />
        </div>
      </div>
    </blockquote>
  ),
  Callout: ({ title, description, url, buttonText }) => (
    <div className="callout">
      <div style={{ position: "relative", width: 400, height: 300 }}>
        <Image
          className="learnImage"
          src="/img/tina-laptop.png"
          alt="Tina laptop"
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        <a href={url} className="calloutButton">
          {buttonText}
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 448 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
          </svg>
        </a>
      </div>
    </div>
  ),
  Codesandbox: ({ embedSrc, title }) => (
    <div>
      <iframe
        src={embedSrc}
        style={{
          width: "100%",
          height: "500px",
          border: "none",
          borderRadius: "4px",
          overflow: "hidden",
        }}
        title={title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        className="wide"
      ></iframe>
    </div>
  ),
  Diagram: ({ alt, src }) => (
    <div
      style={{
        margin: "auto",
        padding: "2rem .5rem",
        border: "none",
        position: "relative",
        width: "100%",
        height: 400,
      }}
    >
      <Image src={src} alt={alt} layout="fill" objectFit="contain" />
    </div>
  ),
  WideImage: ({ alt, src }) => (
    <div
      style={{
        margin: "1.5rem auto",
        overflow: "hidden",
        width: "140%",
        maxWidth: "calc(100vw - 5rem)",
        left: "50%",
        position: "relative",
        transform: "translate3d(-50%,0,0)",
        borderRadius: "5px",
        border: "1px solid rgba(0,0,0,0.1)",
        height: 400, // example fixed height
      }}
    >
      <Image src={src} alt={alt} layout="fill" objectFit="cover" />
    </div>
  ),
  code_block: ({ value, lang, children }) => {
    const Block = () => {
      const [hasCopied, setHasCopied] = React.useState(false);

      const handleCopy = () => {
        navigator.clipboard.writeText(children || value || "");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      };

      return (
        <div className="word-break white-space margin-0 relative overflow-x-hidden !rounded-xl pb-3">
          <button
            onClick={handleCopy}
            className="absolute right-3 top-4 z-10 flex size-6 items-center justify-center rounded text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50"
          >
            {hasCopied ? (
              <CheckIconComponent className="size-4" />
            ) : (
              <ClipboardIconComponent className="size-4" />
            )}
            <span className="sr-only">Copy</span>
          </button>
          <Prism
            value={children || value || ""}
            lang={lang || "jsx"}
            theme="nightOwl"
          />
        </div>
      );
    };

    return (
      <div className="relative">
        <Block />
      </div>
    );
  },

  GraphQLCodeBlock: ({
    query,
    response,
    preselectResponse,
    customQueryName,
    customResponseName,
  }) => {
    return (
      <GraphQLQueryResponseTabs
        query={query}
        response={response}
        preselectResponse={preselectResponse}
        customQueryName={customQueryName}
        customResponseName={customResponseName}
      />
    );
  },
  CustomFieldComponentDemo: () => (
    <iframe
      height="450"
      style={{ width: "100%" }}
      scrolling="no"
      title="CSS Filters + A Springer Spaniel"
      src="https://codepen.io/kendallstrautman/embed/WNbzLJZ?height=265&theme-id=default&default-tab=css,result"
      frameBorder="no"
      allowTransparency={true}
      allowFullScreen={true}
    >
      See the Pen{" "}
      <a href="https://codepen.io/kendallstrautman/pen/WNbzLJZ">
        CSS Filters + A Springer Spaniel
      </a>{" "}
      by Kendall Strautman (
      <a href="https://codepen.io/kendallstrautman">@kendallstrautman</a>) on{" "}
      <a href="https://codepen.io">CodePen</a>.
    </iframe>
  ),
  CloudinaryVideo: ({ src }) => (
    <video className="video my-6" autoPlay loop muted playsInline>
      <source src={src + ".webm"} type="video/webm" />
      <source src={src + ".mp4"} type="video/mp4" />
    </video>
  ),
  Button: ({ link, label }) => (
    <div className="my-6 flex w-full justify-start">
      <a
        // eslint-disable-next-line tailwindcss/no-arbitrary-value
        className="focus:shadow-outline flex items-center gap-1 whitespace-nowrap rounded-full border border-orange-600 bg-gradient-to-br from-orange-400 to-orange-600 px-6 pb-[10px] pt-[12px] font-tuner text-base font-medium leading-tight text-white transition duration-150 ease-out hover:-translate-x-px hover:-translate-y-px hover:text-gray-50 focus:outline-none active:translate-x-px active:translate-y-px"
        href={link}
        target="_blank"
      >
        {label} <BiRightArrowAlt className="-mt-1 h-5 w-auto opacity-70" />
      </a>
    </div>
  ),
};

function FormatHeaders({
  children,
  level,
}: {
  children?: React.ReactNode;
  level: number;
}) {
  const HeadingTag = `h${level}` as any;
  const id = getDocId(
    children?.props?.content?.map((content: any) => content.text).join("") ??
      children,
  );

  const linkHref = `#${id}`;

  const styles = {
    1: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-4xl !mt-16 mb-4",
    2: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-3xl !mt-12 mb-2",
    3: "bg-gradient-to-br from-blue-800 via-blue-900 to-blue-100 bg-clip-text text-transparent text-xl font-medium !mt-8 mb-2 !important",
    4: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-xl font-medium !mt-2 mb-2",
    5: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-lg font-medium !mt-2 mb-1",
    6: "text-gray-500 text-base font-normal mt-2 mb-1",
  };

  const linkColor = {
    1: "text-orange-500",
    2: "text-orange-500",
    3: "text-blue-900",
    4: "text-orange-500",
    5: "text-orange-500",
    6: "text-gray-500",
  };

  const handleHeaderClick = (event) => {
    event.preventDefault();
    scrollToElement(id);
    window.history.pushState(null, "", linkHref);
  };

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 130; //offset in pixels
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      scrollToElement(hash);
    }
    //this is used for when you get sent a link with a hash (i.e link to a header)
  }, []);

  return (
    <HeadingTag
      id={id}
      className={`${styles[level]} group relative cursor-pointer`}
    >
      <a
        href={linkHref}
        className="inline-block no-underline"
        onClick={handleHeaderClick}
      >
        {" "}
        {children}
        <FiLink
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className={`${linkColor[level]} group-hover:animate-wiggle absolute ml-1 opacity-0 transition-opacity duration-200 group-hover:opacity-80`}
          style={{
            display: "inline-block",
            marginTop: "0.25rem",
          }}
        />
      </a>
    </HeadingTag>
  );
}

export default DocsMDXComponentRenderer;
