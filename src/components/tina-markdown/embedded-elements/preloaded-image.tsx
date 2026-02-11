import { type ImageMetadata, TinaImage } from "../../ui/tina-image";

interface PreloadedImageProps {
  image: ImageMetadata | string;
  caption?: string;
}

export const PreloadedImage = ({ image, caption }: PreloadedImageProps) => {
  // Normalize image to ImageMetadata format
  const imageData: ImageMetadata =
    typeof image === "string"
      ? { src: image, alt: "" }
      : image || { src: "", alt: "" };

  return (
    <span className="my-6 flex flex-col gap-2">
      <span className="relative w-full max-w-2xl">
        <TinaImage
          src={imageData}
          alt={imageData.alt || ""}
          caption={caption}
          enableLightbox={true}
          width={imageData.width}
          height={imageData.height}
          fill={!imageData.width || !imageData.height}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          className="rounded-xl"
          style={{
            objectFit: "contain",
            width: "100%",
            height: "auto",
          }}
          priority
        />
      </span>
    </span>
  );
};

export default PreloadedImage;
