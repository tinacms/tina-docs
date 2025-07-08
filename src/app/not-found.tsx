import ErrorWrapper from "./error-wrapper";

export default async function NotFound() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:p-4 max-w-[2560px] mx-auto">
      <main className="flex-1">
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
      </main>
    </div>
  );
}
