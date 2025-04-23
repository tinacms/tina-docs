import {
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import MarkdownComponentMapping from "../markdown-component-mapping";

const ApiReference = (data: {
  title: string;
  property: {
    groupName: string;
    name: string;
    description: string;
    type: string;
    default: string;
    required: boolean;
  }[];
}) => {
  const { title, property: properties } = data;
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
              components={MarkdownComponentMapping}
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
          type="button"
          onClick={() =>
            setOpenGroups(
              openGroups.includes(groupName)
                ? openGroups.filter((group) => group !== groupName)
                : [...openGroups, groupName]
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

          <ChevronRightIcon
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
                    {propertyItem(property)}
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
        title ? "pt-6" : "pt-2"
      }`}
    >
      {title && <h2 className="mb-6 text-3xl text-blue-600">{title}</h2>}

      {/* Process properties in order, grouping only adjacent items with same groupName */}
      {(() => {
        if (!properties?.length) return null;

        const result: any[] = [];
        let currentGroup: string | null = null;
        let currentGroupProperties: any[] = [];

        // Process each property in original order
        properties.forEach((property, index) => {
          // If property has no groupName, render it individually
          if (!property.groupName) {
            // If we were building a group, finalize it
            if (currentGroup) {
              result.push(
                <React.Fragment key={`group-${result.length}`}>
                  {group(currentGroup, currentGroupProperties)}
                </React.Fragment>
              );
              currentGroup = null;
              currentGroupProperties = [];
            } else {
              if (index !== 0) {
                result.push(
                  <hr className="m-auto h-0.5 w-4/5 rounded-lg bg-gray-200" />
                );
              }
            }

            // Add the individual property
            result.push(
              <React.Fragment key={`ind-${index}`}>
                {propertyItem(property)}
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
                    {group(currentGroup, currentGroupProperties)}
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
              {group(currentGroup, currentGroupProperties)}
            </React.Fragment>
          );
        }

        return result;
      })()}

      {properties?.some((property) => property.required) && (
        <div className=" mx-6 mt-6 flex items-start gap-3 rounded-md bg-blue-50 p-4">
          <InformationCircleIcon className="mt-0.5 size-5 shrink-0 text-[#3B82F6]" />
          <p className="text-sm text-gray-700">
            All properties marked as{" "}
            <span className="font-medium text-[#FF5533]">REQUIRED</span> must be
            specified for the field to work properly.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiReference;
