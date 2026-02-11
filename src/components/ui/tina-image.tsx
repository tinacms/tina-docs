"use client";

import { getImagePath } from "@/utils/image-path";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageErrorState } from "./image-error-state";
import { ImageOverlayWrapper } from "./image-overlay-wrapper";

export interface ImageMetadata {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface TinaImageProps extends Omit<ImageProps, "src" | "alt"> {
  /**
   * Image source - can be a string path or an ImageMetadata object
   */
  src: string | ImageMetadata;
  /**
   * Alt text for the image
   */
  alt: string;
  /**
   * Optional caption to display below the image
   */
  caption?: string;
  /**
   * Whether to enable the lightbox overlay on click
   * @default true
   */
  enableLightbox?: boolean;
}

/**
 * Unified image component that handles base path resolution and optional lightbox.
 * Supports both legacy string paths and new ImageMetadata objects with dimensions.
 */
export const TinaImage = ({
  src,
  alt,
  caption,
  enableLightbox = true,
  className,
  width,
  height,
  fill,
  priority,
  ...restProps
}: TinaImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize src to ImageMetadata format
  const imageData: ImageMetadata =
    typeof src === "string"
      ? { src, alt, width: width as number, height: height as number }
      : { alt, ...src };

  // Resolve the image path with base path handling
  const resolvedSrc = getImagePath(imageData.src);

  // Determine if we should use fill or fixed dimensions
  // Use fill if explicitly set, or if no dimensions are available
  const useFill =
    fill !== undefined
      ? fill
      : !(imageData.width && imageData.height) && !(width && height);

  // Calculate aspect ratio for skeleton
  const aspectRatio =
    imageData.width && imageData.height
      ? `${imageData.width}/${imageData.height}`
      : width && height
        ? `${width}/${height}`
        : "16/9"; // Default aspect ratio

  // Build the image element with loading state
  // Use span instead of div to avoid hydration errors when inside <p> tags
  // Next.js Image with fill renders as a span, so we wrap in a span container
  const imageElement = (
    <span className="relative block w-full h-full">
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <span className="absolute inset-0 bg-neutral-background-secondary animate-pulse rounded-xl z-0" />
      )}

      {/* Error state */}
      {hasError && <ImageErrorState alt={imageData.alt || alt} size="small" />}

      <Image
        src={resolvedSrc}
        alt={imageData.alt || alt}
        width={useFill ? undefined : imageData.width || width}
        height={useFill ? undefined : imageData.height || height}
        fill={useFill}
        priority={priority}
        className={className}
        style={{
          ...restProps.style,
          opacity: isLoading || hasError ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
        onLoad={() => setIsLoading(false)}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...restProps}
      />
    </span>
  );

  // If lightbox is enabled and image is loaded without errors, wrap with ImageOverlayWrapper
  if (enableLightbox && !isLoading && !hasError) {
    return (
      <>
        <ImageOverlayWrapper
          src={imageData.src}
          alt={imageData.alt || alt}
          caption={caption}
        >
          {imageElement}
        </ImageOverlayWrapper>
        {caption && (
          <span className="font-tuner text-sm text-neutral-text-secondary block text-left mt-2">
            Figure: {caption}
          </span>
        )}
      </>
    );
  }

  // Return without lightbox wrapper
  return (
    <>
      {imageElement}
      {caption && (
        <span className="font-tuner text-sm text-neutral-text-secondary block text-left mt-2">
          Figure: {caption}
        </span>
      )}
    </>
  );
};
