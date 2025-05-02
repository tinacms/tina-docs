export function getUrl(input: any): string {
  let url = "";
  if (typeof input === "string") {
    url = input;
  } else if (input && typeof input === "object") {
    if (input.id && typeof input.id === "string") {
      url = input.id;
    }
  }

  if (url.startsWith("content")) {
    url = url.replace(/^content/, "");
  }

  url = url.replace(/\.(mdx|md)$/, "");

  if (url === "/docs/index") {
    url = "/docs";
  }

  if (!url.startsWith("/")) {
    url = `/${url}`;
  }
  return url;
}
