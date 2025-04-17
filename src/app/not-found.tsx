import ErrorWrapper from "./error-wrapper";

export default async function NotFound() {

  return (
    <ErrorWrapper description="We couldn't find what you were looking for." errorConfig={{
      errorPageTitle: "404 Not Found",
      errorLinks: [
        {
          linkText: "Return to docs",
          linkUrl: "/docs"
        }
      ]
    }} />
  );
}
