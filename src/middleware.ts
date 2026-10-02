import Negotiator from "negotiator";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const type = new Negotiator({
    headers: { accept: request.headers.get("accept") ?? "*/*" },
  }).mediaType(["text/html", "text/markdown"]);
  const url = request.nextUrl.clone();
  url.pathname = `/api/markdown${url.pathname.slice("/docs".length) || "/index"}`;

  const response =
    process.env.EXPORT_MODE !== "static" && type === "text/markdown"
      ? NextResponse.rewrite(url)
      : NextResponse.next();
  response.headers.append("Vary", "Accept");
  return response;
}

export const config = { matcher: "/docs/:path*" };
