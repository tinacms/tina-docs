"use client";

import type { ImageMetadata } from "@/tina/collections/image-metadata";
import Image from "next/image";
import { useState } from "react";
import { ImageOverlayWrapper } from "../../ui/image-overlay-wrapper";

interface ImageEmbedProps {
  image?: Partial<ImageMetadata>;
  caption?: string;
  disableLightbox?: boolean;
}

const ImageEmbed = ({
  image,
  caption,
  disableLightbox = false,
}: ImageEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!image?.src) return null;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const resolvedSrc = `${basePath}${image.src}`;
  const alt = image.alt || caption || "";
  const hasDimensions = !!(image.width && image.height);

  const imageElement = (
    <span className="relative w-full max-w-2xl block">
      {hasDimensions ? (
        <span className="relative block">
          {isLoading && (
            <span className="absolute inset-0 bg-neutral-background-secondary animate-pulse rounded-xl z-0" />
          )}
          <Image
            src={resolvedSrc}
            alt={alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className={`rounded-xl object-contain w-full h-auto transition-opacity duration-300 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsLoading(false)}
          />
        </span>
      ) : (
        <span className="relative overflow-hidden rounded-xl block w-full aspect-video">
          {isLoading && (
            <span className="absolute inset-0 bg-neutral-background-secondary animate-pulse rounded-xl z-0" />
          )}
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className={`object-contain transition-opacity duration-300 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsLoading(false)}
          />
        </span>
      )}
    </span>
  );

  return (
    <span className="my-6 flex flex-col gap-2">
      {disableLightbox ? (
        imageElement
      ) : (
        <ImageOverlayWrapper src={image.src} alt={alt} caption={caption}>
          {imageElement}
        </ImageOverlayWrapper>
      )}
      {caption && (
        <span className="font-tuner text-sm text-neutral-text-secondary block text-left">
          Figure: {caption}
        </span>
      )}
    </span>
  );
};

export default ImageEmbed;
