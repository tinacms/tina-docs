import type React from "react";
import "@/styles/global.css";
import AdminLink from "@/src/components/ui/admin-link";
import { TailwindIndicator } from "../components/ui/tailwind-indicator";

export default function RootLayout({
  children = null, //default value for cms
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
      </head>
      <body>
        <AdminLink />
        <TailwindIndicator />
        <div className="blob-bg font-sans flex min-h-screen flex-col bg-blob-bg bg-[length:100%_100%] bg-fixed bg-top">
          <div className="flex flex-1 flex-col items-center">{children}</div>
        </div>
      </body>
    </html>
  );
}
