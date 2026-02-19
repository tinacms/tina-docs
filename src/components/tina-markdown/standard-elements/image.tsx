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

  return (
    <span className="my-6 flex flex-col gap-2">
      <span className="relative w-full max-w-2xl block">
        {hasDimensions ? (
          <TinaImage
            src={{
              src: imageSrc,
              width: props.width,
              height: props.height,
              alt: imageAlt,
            }}
            alt={imageAlt}
            enableLightbox={true}
            width={props.width}
            height={props.height}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className="rounded-xl"
            style={{
              objectFit: "contain",
              width: "100%",
              height: "auto",
            }}
          />
        ) : (
          <span
            className="relative overflow-hidden rounded-xl block w-full"
            style={{ paddingBottom: "56.25%", height: 0 }}
          >
            <TinaImage
              src={imageSrc}
              alt={imageAlt}
              enableLightbox={true}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              style={{ objectFit: "contain" }}
            />
          </span>
        )}
      </span>
      {imageCaption && (
        <span className="font-tuner text-sm text-neutral-text-secondary block text-left">
          Figure: {imageCaption}
        </span>
      )}
    </span>
  );
};
