"use client";

import {
  type ImageMetadata,
  getImagePath,
  normalizeImage,
} from "@/utils/image-path";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageErrorState } from "./image-error-state";
import { ImageOverlayWrapper } from "./image-overlay-wrapper";

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
  style,
  ...restProps
}: TinaImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize src to ImageMetadata format
  const imageData = normalizeImage(src, alt);

  // Resolve the image path with base path handling
  const resolvedSrc = getImagePath(imageData.src);

  // Determine if we should use fill or fixed dimensions
  // Use fill if explicitly set, or if no dimensions are available
  const useFill =
    fill !== undefined
      ? fill
      : !(imageData.width && imageData.height) && !(width && height);

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
      {hasError && <ImageErrorState alt={imageData.alt || alt} />}

      <Image
        src={resolvedSrc}
        alt={imageData.alt || alt}
        width={useFill ? undefined : imageData.width || width}
        height={useFill ? undefined : imageData.height || height}
        fill={useFill}
        priority={priority}
        className={className}
        style={{
          ...style,
          opacity: isLoading || hasError ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...restProps}
      />
    </span>
  );

  const captionElement = caption ? (
    <span className="font-tuner text-sm text-neutral-text-secondary block text-left mt-2">
      Figure: {caption}
    </span>
  ) : null;

  // Always render the lightbox wrapper to avoid re-mounting the Image on load.
  // The wrapper handles its own disabled state visually.
  if (enableLightbox) {
    return (
      <>
        <ImageOverlayWrapper
          src={imageData.src}
          alt={imageData.alt || alt}
          caption={caption}
        >
          {imageElement}
        </ImageOverlayWrapper>
        {captionElement}
      </>
    );
  }

  return (
    <>
      {imageElement}
      {captionElement}
    </>
  );
};
