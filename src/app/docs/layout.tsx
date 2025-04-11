import React from "react";
import DocsLayoutClient from "./toc-wrapper";
import { getDocsNav } from "@/utils/docs/getDocumentNavigation";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const navDocData = await getDocsNav();

  return (
    //@ts-ignore
    <DocsLayoutClient NavigationDocsData={navDocData}>
      {children}
    </DocsLayoutClient>
  );
}
