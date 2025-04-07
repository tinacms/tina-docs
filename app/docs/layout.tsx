import React from 'react';
import DocsLayoutClient from './layout-client';
import { getEntireCollection } from '../../utils/generic/fetchEntireCollection';
import { VersionProvider } from '../../components/docs/VersionContext';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const [navDocData, versionData] = await Promise.all([
    getEntireCollection('docsTableOfContentsConnection'),
    getEntireCollection('versionsConnection'),
  ]);

  const versions = versionData.map((version: any) => version.node.versionNumber);

  return (
    //@ts-ignore
    <VersionProvider versions={versions} initialVersion="Latest">
      {/* @ts-ignore */}
      <DocsLayoutClient NavigationDocsData={navDocData} header="Tina Docs" versions={versions}>
        {children}
      </DocsLayoutClient>
    </VersionProvider>
  );
}