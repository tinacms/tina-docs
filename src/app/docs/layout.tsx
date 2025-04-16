import { getDocsNav } from "@/utils/docs/getDocumentNavigation";
import type React from "react";
import DocsLayoutClient from "./toc-wrapper";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const navDocData = await getDocsNav();
  return (
    <DocsLayoutClient NavigationDocsData={navDocData}>
      {children}
    </DocsLayoutClient>
  );
}
