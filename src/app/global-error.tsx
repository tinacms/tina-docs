"use client"; // Error boundaries must be Client Components
import ErrorWrapper from "./error-wrapper";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html lang="en">
      <body>
        <ErrorWrapper description="Something went wrong!" />
        <button
          type="button"
          onClick={() => reset()}
          className="text-slate-500 shadow-sm hover:shadow-md outline outline-slate-200 hover:text-slate-700 rounded-md p-2 bg-white/50 hover:bg-white/90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
