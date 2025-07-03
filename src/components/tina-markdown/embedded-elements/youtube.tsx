import { tinaField } from "tinacms/dist/react";

export default function Youtube(data: {
  embedSrc: string;
  caption?: string;
  minutes?: string;
}) {
  const { embedSrc, caption, minutes } = data;
  return (
    <div className="my-6 flex flex-col gap-2">
      <div
        className="relative aspect-video w-full"
        data-tina-field={tinaField(data, "embedSrc")}
      >
        <iframe
          className="absolute left-0 top-0 size-full rounded-xl"
          src={embedSrc}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        />
      </div>
      {caption && (
        <div
          className="font-tuner text-sm text-neutral-text-secondary"
          data-tina-field={tinaField(data, "caption")}
        >
          Video: {caption} {minutes && `(${minutes} minutes)`}
        </div>
      )}
    </div>
  );
}
