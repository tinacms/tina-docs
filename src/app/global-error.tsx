"use client"; // Error boundaries must be Client Components
import ErrorWrapper from "./error-wrapper";
import "@/styles/global.css";
import RootLayout from "./layout";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
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
  );
}
