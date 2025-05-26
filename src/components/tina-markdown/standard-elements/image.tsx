import Image from "next/image";
import { useState } from "react";

export const ImageComponent = (props) => {
  const [dimensions, setDimensions] = useState({ width: 16, height: 9 });
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = (event) => {
    const img = event.target as HTMLImageElement;
    if (img) {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsLoading(false);
    }
  };

  return (
    <span className="my-4 flex flex-col gap-2">
      <span className="relative mx-auto w-full max-w-xl block">
        <span
          className="relative overflow-hidden rounded-xl block"
          style={{
            aspectRatio: `${dimensions.width}/${dimensions.height}`,
            maxHeight: "600px",
            minHeight: "200px",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <Image
            src={props?.url || ""}
            alt={props?.alt || ""}
            title={props?.caption || ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            style={{ objectFit: "contain" }}
            onLoad={handleImageLoad}
            priority
          />
        </span>
      </span>
      {props?.caption && (
        <span className="font-tuner text-sm text-gray-500 block">
          Figure: {props.caption}
        </span>
      )}
    </span>
  );
};
