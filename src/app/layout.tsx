import "@/styles/global.css";
import AdminLink from "@/components/ui/admin-link";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import { ThemeSelector } from "@/components/ui/theme-selector";
import settings from "@/content/settings/config.json";
import client from "@/tina/__generated__/client";
import { GoogleTagManager } from "@next/third-parties/google";
import { ThemeProvider } from "next-themes";
import { Inter, Roboto_Flex } from "next/font/google";

import { TabsLayout } from "@/components/docs/layout/tab-layout";
import type React from "react";
import { TinaClient } from "./tina-client";

const isDev = process.env.NODE_ENV === "development";

const body = Inter({ subsets: ["latin"], variable: "--body-font" });
const heading = Roboto_Flex({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--heading-font",
});

const isThemeSelectorEnabled =
  isDev || process.env.NEXT_PUBLIC_ENABLE_THEME_SELECTION === "true";

const theme = settings.selectedTheme || "default";
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children = null,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`theme-${theme}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${body.variable} ${heading.variable}`}>
        {!isDev && gtmId && (
          <GoogleTagManager
            gtmId={gtmId}
            gtmScriptUrl="https://www.googletagmanager.com/gtm.js"
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme={theme}
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {isThemeSelectorEnabled && <ThemeSelector />}
          <Content>
            <DocsMenu>{children}</DocsMenu>
          </Content>
        </ThemeProvider>
      </body>
    </html>
  );
}

const Content = ({ children }: { children?: React.ReactNode }) => (
  <>
    <AdminLink />
    <TailwindIndicator />
    <div className="font-sans flex min-h-screen flex-col bg-background-color">
      <div className="flex flex-1 flex-col items-center">{children}</div>
    </div>
  </>
);

const DocsMenu = async ({ children }: { children?: React.ReactNode }) => {
  // Fetch navigation data that will be shared across all docs pages

  const navigationData = await client.queries.minimisedNavigationBarFetch({
    relativePath: "docs-navigation-bar.json",
  });

  return (
    <div className="relative flex flex-col w-full pb-2">
      <TinaClient
        props={{
          query: navigationData.query,
          variables: navigationData.variables,
          data: navigationData.data,
          children,
        }}
        Component={TabsLayout}
      />
    </div>
  );
};
