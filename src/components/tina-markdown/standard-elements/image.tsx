"use client";

import { getImagePath } from "@/utils/image-path";
import { useEffect, useState } from "react";
import { TinaImage } from "../../ui/tina-image";

export const ImageComponent = (props) => {
  // Support both legacy string format and new ImageMetadata object format
  const imageSrc = props?.url || props?.src || "";
  const imageAlt = props?.alt || "";
  // Markdown image title (from "caption" in ![alt](url "caption")) is passed as 'title' prop
  const imageCaption = props?.caption || props?.title || "";

  const [dimensions, setDimensions] = useState<{
    width?: number;
    height?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  // If props contains width/height (from metadata), use them
  const hasMetadataDimensions = props?.width && props?.height;

  // Load dimensions at runtime if not provided
  useEffect(() => {
    if (hasMetadataDimensions) {
      setDimensions({ width: props.width, height: props.height });
      setIsLoading(false);
      return;
    }

    if (!imageSrc) {
      setIsLoading(false);
      return;
    }

    // Skip if it's an external URL (can't reliably get dimensions)
    if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
      setIsLoading(false);
      return;
    }

    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };

    // Construct full path for loading
    const resolvedSrc = getImagePath(imageSrc);
    img.src = resolvedSrc;
  }, [imageSrc, hasMetadataDimensions, props.width, props.height]);

  // Calculate aspect ratio for skeleton
  const aspectRatio =
    dimensions.width && dimensions.height
      ? `${dimensions.width}/${dimensions.height}`
      : "16/9"; // Default aspect ratio

  return (
    <span className="my-6 flex flex-col gap-2">
      <span className="relative w-full max-w-2xl block">
        <span
          className="relative overflow-hidden rounded-xl block"
          style={{
            aspectRatio: aspectRatio,
            width: "100%",
            height: "auto",
          }}
        >
          {/* Loading skeleton */}
          {isLoading && (
            <span className="absolute inset-0 bg-neutral-background-secondary animate-pulse rounded-xl z-0" />
          )}
          <span
            style={{
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
              display: "block",
            }}
          >
            <TinaImage
              src={
                hasMetadataDimensions || (dimensions.width && dimensions.height)
                  ? {
                      src: imageSrc,
                      width: props.width || dimensions.width,
                      height: props.height || dimensions.height,
                      alt: imageAlt,
                    }
                  : imageSrc
              }
              alt={imageAlt}
              enableLightbox={true}
              fill={!hasMetadataDimensions && !dimensions.width}
              width={
                hasMetadataDimensions || dimensions.width
                  ? props.width || dimensions.width
                  : undefined
              }
              height={
                hasMetadataDimensions || dimensions.height
                  ? props.height || dimensions.height
                  : undefined
              }
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              style={
                hasMetadataDimensions || dimensions.width
                  ? {
                      objectFit: "contain",
                      width: "100%",
                      height: "auto",
                    }
                  : {
                      objectFit: "contain",
                    }
              }
              priority
            />
          </span>
        </span>
      </span>
      {/* Render caption outside the image container */}
      {imageCaption && (
        <span className="font-tuner text-sm text-neutral-text-secondary block text-left">
          Figure: {imageCaption}
        </span>
      )}
    </span>
  );
};
