import Link from 'next/link';
import React from 'react';
import '../styles/global.css';
import { SiteLayout } from '../components/SiteLayout';

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
      <body style={{ margin: '3rem' }}>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
