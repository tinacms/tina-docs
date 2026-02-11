interface ImageErrorStateProps {
  alt: string;
  size?: "small" | "large";
}

export const ImageErrorState = ({
  alt,
  size = "small",
}: ImageErrorStateProps) => {
  const iconSize = size === "large" ? "w-16 h-16" : "w-12 h-12";
  const textSize = size === "large" ? "text-base" : "text-sm";
  const spacing = size === "large" ? "mb-4" : "mb-2";
  const padding = size === "large" ? "p-8" : "p-4";

  return (
    <span
      className={`absolute inset-0 flex flex-col items-center justify-center bg-neutral-background-secondary border border-neutral-border rounded-xl ${padding} text-center`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${iconSize} text-neutral-text-tertiary ${spacing}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
      </svg>
      <span className={`${textSize} text-neutral-text-secondary max-w-md`}>
        {alt || "Image failed to load"}
      </span>
    </span>
  );
};
