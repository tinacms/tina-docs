import React from "react";
import "../styles/global.css";
import { SiteLayout } from "../components/SiteLayout";
import AdminLink from "../components/ui/AdminLink";

export default function RootLayout({
  children,
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
