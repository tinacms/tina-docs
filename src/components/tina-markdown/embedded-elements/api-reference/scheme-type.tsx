import React, { useEffect, useState, useContext, createContext } from "react";
import { FaChevronRight } from "react-icons/fa";
import type { IconBaseProps } from "react-icons/lib/iconBase";
import type { ChevronIconProps, SchemaTypeProps } from "./types";
import { resolveReference } from "./utils";

export const ChevronIcon = ({ isExpanded }: ChevronIconProps) => {
  const Icon = FaChevronRight as React.ComponentType<IconBaseProps>;
  return (
    <Icon
      className={`text-neutral-text transition-transform duration-200 ${
        isExpanded ? "rotate-90" : ""
      }`}
      style={{ width: "10px", height: "10px" }}
    />
  );
};

const SchemaContext = createContext<any>({});

// Type rendering component for recursively displaying schema structures
export const SchemaType = ({
  schema,
  depth = 0,
  isNested = false,
  name = "",
  showExampleButton = false,
  onToggleExample = () => {},
  isErrorSchema = false,
}: SchemaTypeProps) => {
  const [isExpanded, setIsExpanded] = useState(false); // Auto-expand first two levels and error schemas
  const definitions = useContext(SchemaContext);

  // Handle null schema
  if (!schema) return <span className="text-gray-500">-</span>;

  // Handle reference schemas
  if (schema.$ref) {
    const refPath = schema.$ref;
    const refName = refPath.split("/").pop();
    const refSchema = resolveReference(refPath, definitions);

    // Check if this is likely an error schema by name
    const probableErrorSchema =
      refName &&
      (refName.toLowerCase().includes("error") ||
        refName.toLowerCase().includes("problem") ||
        refName.toLowerCase().includes("exception"));

    return (
      <div className="ml-4">
        <div className="ml-4">
          <button
            type="button"
            className="flex items-center w-full cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setIsExpanded(!isExpanded);
            }}
          >
            <span className="flex items-end">
              <span
                className={`group-hover:underline${
                  isErrorSchema || probableErrorSchema ? " text-red-600" : ""
                }${name === "Array of object" ? " ml-4" : ""}`}
              >
                {refName}
              </span>
              {refSchema?.type && (
                <span className="ml-2 text-xs font-mono text-neutral-text-secondary px-2 pb-0.5 rounded">
                  {refSchema.type}
                </span>
              )}
            </span>
            {showExampleButton && (
              <button
                type="button"
                className="ml-4 text-xs text-neutral-text-secondary hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExample();
                }}
                tabIndex={-1}
              >
                JSON Schema Example
              </button>
            )}
            {refSchema && (
              <span className="ml-2 flex items-center">
                <ChevronIcon isExpanded={isExpanded} />
              </span>
            )}
          </button>
        </div>
        {isExpanded &&
          refSchema &&
          refSchema.type === "object" &&
          refSchema.properties && (
            <div className="mt-1 pl-4">
              {Object.entries(refSchema.properties).map(
                ([propName, propSchema]) => (
                  <div key={propName}>
                    <SchemaType
                      schema={propSchema as any}
                      name={propName}
                      depth={depth + 1}
                      isNested={true}
                    />
                  </div>
                )
              )}
            </div>
          )}
        {isExpanded && refSchema && refSchema.type !== "object" && (
          <div className="mt-1 pl-4">
            <SchemaType schema={refSchema} depth={depth + 1} isNested={true} />
          </div>
        )}
      </div>
    );
  }

  // Get type or infer it from properties
  const type =
    schema.type ||
    (schema.properties ? "object" : schema.items ? "array" : "unknown");

  // Check for common error fields
  const hasErrorFields =
    schema.properties &&
    (schema.properties.error ||
      schema.properties.message ||
      schema.properties.code ||
      schema.properties.errors ||
      schema.properties.detail);

  // Complex objects and arrays
  const isArrayOfObjects =
    type === "array" &&
    schema.items &&
    (schema.items.properties || schema.items.$ref);

  const isExpandable =
    schema.$ref ||
    (type === "object" &&
      schema.properties &&
      Object.keys(schema.properties).length > 0) ||
    isArrayOfObjects;

  // If not expandable, show primitive type info
  if (!isExpandable) {
    return (
      <div className={`${isNested ? "ml-4" : ""}`}>
        <div className="flex items-end">
          {name && (
            <span
              className={`text-neutral-text mr-2${
                name === "Array of object" ? " ml-4" : ""
              }`}
            >
              {name}
            </span>
          )}
          <span className="text-xs font-mono text-neutral-text-secondary px-2  pb-0.5 rounded">
            {type}
            {schema.format ? ` (${schema.format})` : ""}
          </span>
          {schema.enum && (
            <span className="ml-2 py-0.5 text-xs text-neutral-text-secondary font-mono">
              enum: [{schema.enum.map((v: any) => JSON.stringify(v)).join(", ")}
              ]
            </span>
          )}
        </div>
        {schema.description && (
          <div className="text-sm text-neutral-text-secondary mb-2">
            {schema.description}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${isNested ? "ml-4" : ""}`}>
      <div
        className={`flex items-center w-full${
          isExpandable ? " cursor-pointer group" : ""
        }`}
        onClick={isExpandable ? () => setIsExpanded(!isExpanded) : undefined}
        aria-label={
          isExpandable ? (isExpanded ? "Collapse" : "Expand") : undefined
        }
        tabIndex={isExpandable ? 0 : -1}
        role={isExpandable ? "button" : undefined}
        onKeyPress={
          isExpandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ")
                  setIsExpanded(!isExpanded);
              }
            : undefined
        }
      >
        <div className="flex items-center">
          <div className="flex items-end gap-4">
            {name && (
              <span
                className={`group-hover:underline${
                  isErrorSchema || hasErrorFields ? " text-red-600" : ""
                }${name === "Array of object" ? " ml-4" : ""}`}
              >
                {name}
              </span>
            )}
            {type === "array" && schema.items && (
              <span className="text-neutral-text-secondary pb-0.5 font-mono text-xs">
                {schema.items && (schema.items.properties || schema.items.$ref)
                  ? "array [object]"
                  : `array [${schema.items?.type ? schema.items.type : "any"}]`}
              </span>
            )}
            {type === "object" && (
              <span className="text-neutral-text-secondary font-mono text-xs">
                object
              </span>
            )}

            {isExpandable && (
              <div className="pb-1">
                <ChevronIcon isExpanded={isExpanded} />
              </div>
            )}
          </div>
        </div>
        {showExampleButton && depth === 0 && type === "array" && (
          <button
            type="button"
            className="ml-2 text-xs text-neutral-text hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
          >
            JSON Schema Example
          </button>
        )}
        {showExampleButton && depth === 0 && type !== "array" && (
          <button
            type="button"
            className="ml-auto text-xs text-neutral-text hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
            style={{ marginLeft: "auto" }}
          >
            JSON Schema Example
          </button>
        )}
        {showExampleButton && depth !== 0 && (
          <button
            type="button"
            className="ml-2 text-xs text-blue-600 hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
          >
            Show example
          </button>
        )}
      </div>
      {/* Animated expandable content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        {isExpanded && (
          <div className="pl-4">
            {type === "object" && schema.properties && (
              <div>
                {Object.entries(schema.properties).map(
                  ([propName, propSchema]: [string, any]) => {
                    // Determine type and format
                    const propType =
                      propSchema.type ||
                      (propSchema.properties
                        ? "object"
                        : propSchema.items
                          ? "array"
                          : "unknown");
                    const format = propSchema.format;
                    const isArray = propType === "array";
                    const itemType = isArray
                      ? propSchema.items?.type ||
                        (propSchema.items?.properties ? "object" : "any")
                      : null;
                    const enumVals = propSchema.enum;
                    const isObject =
                      propType === "object" && propSchema.properties;
                    return (
                      <React.Fragment key={propName}>
                        <div className="flex items-center mb-1">
                          <span className="font-mono text-neutral-text mr-2">
                            {propName}
                          </span>
                          <span className="text-xs font-mono text-neutral-text px-2 py-0.5 rounded">
                            {isArray ? `[${itemType}]` : propType}
                            {format ? ` (${format})` : ""}
                          </span>
                          {enumVals && (
                            <span className="ml-2 text-xs text-neutral-text">
                              enum: [
                              {enumVals
                                .map((v: any) => JSON.stringify(v))
                                .join(", ")}
                              ]
                            </span>
                          )}
                        </div>
                        {propSchema.description && (
                          <div className="text-sm text-neutral-text-secondary ml-2 mb-1">
                            {propSchema.description}
                          </div>
                        )}
                        {isObject && (
                          <div className="ml-4">
                            <SchemaType
                              schema={propSchema}
                              depth={depth + 1}
                              isNested={true}
                              name={propName}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  }
                )}
                {!Object.keys(schema.properties).length && (
                  <span className="text-gray-500 italic">Empty object</span>
                )}
              </div>
            )}
            {isArrayOfObjects && (
              <div>
                <SchemaType
                  schema={schema.items}
                  depth={depth + 1}
                  isNested={true}
                  isErrorSchema={isErrorSchema}
                />
              </div>
            )}
            {schema.additionalProperties && (
              <div className="mt-2">
                <div className="text-gray-800 font-medium">
                  Additional properties:
                </div>
                <SchemaType
                  schema={
                    typeof schema.additionalProperties === "boolean"
                      ? { type: "any" }
                      : schema.additionalProperties
                  }
                  depth={depth + 1}
                  isNested={true}
                  isErrorSchema={isErrorSchema}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
