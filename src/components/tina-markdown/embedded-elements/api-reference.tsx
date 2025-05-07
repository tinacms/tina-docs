import React, { useState, useEffect, useRef } from "react";
import { RxInfoCircled, RxMinus, RxPlus } from "react-icons/rx";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import MarkdownComponentMapping from "../markdown-component-mapping";

const ApiReference = (data: {
  property: {
    groupName: string;
    name: string;
    description: string;
    type: string;
    default: string;
    required: boolean;
  }[];
}) => {
  const { property: properties } = data;
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const groupRefs = useRef(new Map());

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      for (const groupName of openGroups) {
        const element = groupRefs.current.get(groupName);
        if (element) {
          const content = element.firstElementChild;
          if (content) {
            element.style.height = `${content.offsetHeight}px`;
          }
        }
      }
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, [openGroups]);

  const propertyItem = (property, isLast = false) => {
    return (
      <div
        className={`space-y-4 px-6 py-3 min-h-18 ${
          !isLast ? "border-b border-neutral-border" : ""
        }`}
      >
        <div className="flex flex-col gap-2 md:gap-8 md:flex-row md:items-start">
          <div className="w-full md:w-1/3 md:min-w-30">
            <div className="inline-block max-w-full break-normal font-inter font-bold text-lg text-neutral-text">
              {property?.name?.replace(/([A-Z])/g, "\u200B$1")}
            </div>
            <div className="py-1">
              {property.required && (
                <p className="text-2xs font-bold text-brand-primary">
                  REQUIRED
                </p>
              )}
              {property.experimental && (
                <p className="text-2xs py-1 font-bold text-brand-tertiary-dark">
                  EXPERIMENTAL
                </p>
              )}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <div className=" text-neutral-text font-inter">{property.type}</div>
            <div className="text-neutral-text-secondary font-inter">
              <TinaMarkdown
                content={property.description as any}
                components={MarkdownComponentMapping}
              />
            </div>
            {property.default && (
              <div className="text-neutral-text-secondary font-inter text-sm">
                Default: <code>{property.default}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const group = (groupName, groupProperties, isLast = false) => {
    const required = groupProperties.some((property) => property.required);
    const isOpen = openGroups.includes(groupName);

    return (
      <div
        className={`group overflow-hidden ${
          !isLast ? "border-b border-neutral-border" : ""
        } ${isOpen ? "md:pb-0 pb-3" : ""}`}
      >
        <button
          type="button"
          onClick={() =>
            setOpenGroups(
              isOpen
                ? openGroups.filter((group) => group !== groupName)
                : [...openGroups, groupName]
            )
          }
          className={`min-h-18 flex w-full items-center justify-between px-6 py-4 text-left ${
            isOpen ? "shadow-lg mb-3" : ""
          }`}
        >
          <div>
            {required && (
              <p className="text-sm font-medium text-brand-primary">REQUIRED</p>
            )}
            <h3 className="text-md font-inter font-bold text-lg text-neutral-text">
              {groupName || "Object"}
            </h3>
          </div>

          <div className="transform transition-transform duration-300 ease-in-out">
            {isOpen ? (
              <RxMinus className="size-5 text-neutral-text" />
            ) : (
              <RxPlus className="size-5 text-neutral-text" />
            )}
          </div>
        </button>
        <div
          ref={(el) => {
            if (el) {
              groupRefs.current.set(groupName, el);
              const content = el.firstElementChild;
              if (content) {
                el.style.height = isOpen ? `${content.offsetHeight}px` : "0px";
              }
            }
          }}
          className="overflow-hidden transition-[height] duration-300 ease-in-out"
        >
          <div
            className={`transform transition-[transform,opacity] duration-300 ease-in-out ${
              isOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <div className="px-6">
              {groupProperties.map((property, index) => {
                return (
                  <div key={`property-${index}`}>
                    {propertyItem(
                      property,
                      index === groupProperties.length - 1
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="my-6 rounded-md brand-glass-gradient shadow-lg">
      {/* Process properties in order, grouping only adjacent items with same groupName */}
      {(() => {
        if (!properties?.length) return null;

        const result: any[] = [];
        let currentGroup: string | null = null;
        let currentGroupProperties: any[] = [];

        // Process each property in original order
        properties.forEach((property, index) => {
          const lastPropertyBorder =
            index === properties.length - 1 &&
            !properties.some((p) => p.required);
          const lastGroupBorder =
            index === properties.length && !properties.some((p) => p.required);

          // If property has no groupName, render it individually
          if (!property.groupName) {
            // If we were building a group, finalize it
            if (currentGroup) {
              result.push(
                <React.Fragment key={`group-${result.length}`}>
                  {group(currentGroup, currentGroupProperties, lastGroupBorder)}
                </React.Fragment>
              );
              currentGroup = null;
              currentGroupProperties = [];
            }
            // Add the individual property
            result.push(
              <React.Fragment key={`ind-${index}`}>
                {propertyItem(property, lastPropertyBorder)}
              </React.Fragment>
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
                    {group(
                      currentGroup,
                      currentGroupProperties,
                      lastGroupBorder
                    )}
                  </React.Fragment>
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
              {group(
                currentGroup,
                currentGroupProperties,
                true && !properties.some((p) => p.required)
              )}
            </React.Fragment>
          );
        }

        return result;
      })()}

      {properties?.some((property) => property.required) && (
        <div className=" mx-4 flex items-start gap-3 rounded-md p-4">
          <RxInfoCircled className="mt-0.5 size-5 shrink-0 text-brand-secondary" />
          <p className="text-sm text-neutral-text-secondary font-inter">
            All properties marked as{" "}
            <span className="font-medium text-brand-primary">REQUIRED</span>{" "}
            must be specified for the field to work properly.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiReference;
