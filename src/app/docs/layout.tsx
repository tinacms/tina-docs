import { getEntireCollection } from "@/utils/fetchAllConnection";
import React from "react";
import DocsLayoutClient from "./toc-wrapper";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const [navDocData, versionsData] = await Promise.all([
    getEntireCollection("docsTableOfContentsConnection"),
    getEntireCollection("versionsConnection"),
  ]);

  return (
    //@ts-ignore
    <DocsLayoutClient
      NavigationDocsData={navDocData}
      versionsData={versionsData}
    >
      {children}
    </DocsLayoutClient>
  );
}
