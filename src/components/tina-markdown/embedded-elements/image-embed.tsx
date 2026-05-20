"use client";

import type { ImageMetadata } from "@/tina/collections/image-metadata";
import { resolveImageSrc } from "@/utils/resolve-image-src";
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

  const resolvedSrc = resolveImageSrc(image.src);
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
            className="rounded-xl"
            style={{
              objectFit: "contain",
              width: "100%",
              height: "auto",
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
            onLoad={() => setIsLoading(false)}
          />
        </span>
      ) : (
        <span
          className="relative overflow-hidden rounded-xl block w-full"
          style={{ paddingBottom: "56.25%", height: 0 }}
        >
          {isLoading && (
            <span className="absolute inset-0 bg-neutral-background-secondary animate-pulse rounded-xl z-0" />
          )}
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            style={{
              objectFit: "contain",
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
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
