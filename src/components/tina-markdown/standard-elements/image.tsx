"use client";

import { TinaImage } from "../../ui/tina-image";

export const ImageComponent = (props: {
  url?: string;
  src?: string;
  alt?: string;
  caption?: string;
  title?: string;
  width?: number;
  height?: number;
}) => {
  const imageSrc = props?.url || props?.src || "";
  const imageAlt = props?.alt || "";
  // Markdown image title (from "caption" in ![alt](url "caption")) is passed as 'title' prop
  const imageCaption = props?.caption || props?.title || "";

  const hasDimensions = !!(props?.width && props?.height);

  // When dimensions are available (injected at build time), use explicit sizing.
  // Otherwise fall back to fill mode (during live CMS editing or external URLs).
  const aspectRatio = hasDimensions
    ? `${props.width}/${props.height}`
    : "16/9";

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
          <TinaImage
            src={
              hasDimensions
                ? {
                    src: imageSrc,
                    width: props.width,
                    height: props.height,
                    alt: imageAlt,
                  }
                : imageSrc
            }
            alt={imageAlt}
            enableLightbox={true}
            fill={!hasDimensions}
            width={hasDimensions ? props.width : undefined}
            height={hasDimensions ? props.height : undefined}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            style={
              hasDimensions
                ? {
                    objectFit: "contain",
                    width: "100%",
                    height: "auto",
                  }
                : {
                    objectFit: "contain",
                  }
            }
          />
        </span>
      </span>
      {imageCaption && (
        <span className="font-tuner text-sm text-neutral-text-secondary block text-left">
          Figure: {imageCaption}
        </span>
      )}
    </span>
  );
};
