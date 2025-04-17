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
        <ErrorWrapper description="Something went wrong!" errorConfig={{
            errorPageTitle: "Internal Server Error",
            errorLinks: [
                {
                    linkText: "Return to docs",
                    linkUrl: "/docs"
                },
                {
                    linkText: "Try again",
                    linkUrl: ""
                }
            ]
        }} />
        
      </body>
    </html>
  );
}
