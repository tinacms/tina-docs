"use client"; // Error boundaries must be Client Components
import ErrorWrapper from "./error-wrapper";
import "@/styles/global.css";
import { SiteLayout } from "../components/SiteLayout";

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
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
      </head>
      <body>
        <SiteLayout>
        <ErrorWrapper
          errorConfig={{
            title: "Sorry, Friend!",
            description: "Something went wrong!",
            links: [
              {
                linkText: "Return to docs",
                linkUrl: "/docs",
              },
              {
                linkText: "Try again",
                linkUrl: "",
              },
            ],
            }}
          />
        </SiteLayout>
      </body>
    </html>
  );
}
