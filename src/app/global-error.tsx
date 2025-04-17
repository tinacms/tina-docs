"use client"; // Error boundaries must be Client Components
import ErrorWrapper from "./error-wrapper";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <ErrorWrapper description="Something went wrong!" />
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}