import ErrorWrapper from "./error-wrapper";

export default async function NotFound() {
  return (
    <ErrorWrapper
      errorConfig={{
        title: "Sorry, Friend!",
        description: "We couldn't find what you were looking for.",
        links: [
          {
            linkText: "Return to docs",
            linkUrl: "/docs",
          },
        ],
      }}
    />
  );
}
