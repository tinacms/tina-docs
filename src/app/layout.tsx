import type React from "react";
import "@/styles/global.css";
import { SiteLayout } from "@/src/components/site-layout";
import AdminLink from "@/src/components/ui/admin-link";

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
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
