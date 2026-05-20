"use client";

import React, { useRef } from "react";
import { ImageField, wrapFieldsWithMeta } from "tinacms";

interface ImageMetadataValue {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Custom TinaCMS field component that wraps the built-in image picker
 * and automatically captures image dimensions on upload/selection.
 *
 * Usage in schema:
 * {
 *   type: "object",
 *   name: "image",
 *   label: "Image",
 *   fields: ImageWithMetadataFields,
 *   ui: {
 *     component: ImageWithMetadataField,
 *   },
 * }
 */
export const ImageWithMetadataField = wrapFieldsWithMeta((props: any) => {
  const { input, field } = props;

  // Get the current value from input.value (the full object)
  const currentValue: ImageMetadataValue = input.value || {};
  const previousSrcRef = useRef<string | undefined>(currentValue.src);

  // Create synthetic props for the src field (the image picker)
  const srcFieldProps = {
    ...props,
    field: {
      ...field,
      name: "src",
      label: field.label || "Image",
      type: "image" as const,
    },
    input: {
      name: `${input.name}.src`,
      value: currentValue.src || "",
      onChange: async (newSrc: string) => {
        if (!newSrc) {
          // If src is cleared, reset all values
          input.onChange({
            src: "",
            width: undefined,
            height: undefined,
            alt: currentValue.alt || "",
          });
          previousSrcRef.current = "";
          return;
        }

        // If the src hasn't actually changed, don't re-fetch dimensions
        if (newSrc === previousSrcRef.current) {
          return;
        }

        previousSrcRef.current = newSrc;

        try {
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
          const img = new Image();
          img.src = `${basePath}${newSrc}`;
          await img.decode();

          input.onChange({
            src: newSrc,
            width: img.naturalWidth,
            height: img.naturalHeight,
            alt: currentValue.alt || "",
          });
        } catch {
          input.onChange({
            src: newSrc,
            width: undefined,
            height: undefined,
            alt: currentValue.alt || "",
          });
        }
      },
      onBlur: () => {},
      onFocus: () => {},
    },
  };

  // Create synthetic props for the alt field (text input)
  const altFieldProps = {
    ...props,
    field: {
      ...field,
      name: "alt",
      label: "Alt Text",
      type: "string" as const,
    },
    input: {
      name: `${input.name}.alt`,
      value: currentValue.alt || "",
      onChange: (newAlt: string) => {
        // Get the latest value from input.value (not the captured currentValue from render)
        const latestValue = input.value || {};
        const updatedValue = {
          src: latestValue.src || "",
          width: latestValue.width,
          height: latestValue.height,
          alt: newAlt,
        };
        input.onChange(updatedValue);
      },
      onBlur: () => {},
      onFocus: () => {},
    },
  };

  const imageFieldProps = {
    ...srcFieldProps,
    field: {
      ...srcFieldProps.field,
      label: " ", // Hides the label and avoids fallback to the form object key
    },
  };

  return (
    <div className="space-y-4">
      {/* Image picker using TinaCMS's built-in ImageField */}
      <div>
        <ImageField {...imageFieldProps} />
      </div>

      {/* Alt text field */}
      <div>
        <label
          htmlFor={altFieldProps.input.name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Alt Text
        </label>
        <input
          type="text"
          id={altFieldProps.input.name}
          name={altFieldProps.input.name}
          value={altFieldProps.input.value}
          onChange={(e) => altFieldProps.input.onChange(e.target.value)}
          onBlur={altFieldProps.input.onBlur}
          onFocus={altFieldProps.input.onFocus}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          placeholder="Describe the image for accessibility"
        />
      </div>

      {/* Display captured dimensions (read-only) */}
      {currentValue.width && currentValue.height && (
        <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
          <strong>Dimensions:</strong> {currentValue.width} ×{" "}
          {currentValue.height}px
        </div>
      )}
    </div>
  );
});
