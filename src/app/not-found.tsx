import ErrorWrapper from "./error-wrapper";

export default async function NotFound() {
  return (
    <ErrorWrapper
      errorConfig={{
        errorPageTitle: "Sorry, Friend!",
        description: "We couldn't find what you were looking for.",
        errorLinks: [
          {
            linkText: "Return to docs",
            linkUrl: "/docs",
          },
        ],
      }}
    />
  );
}
