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
        <div className="font-sans flex min-h-screen flex-col brand-background-gradient">
          <div className="flex flex-1 flex-col items-center">{children}</div>
        </div>
      </body>
    </html>
  );
}
