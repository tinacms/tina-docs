import "@/styles/global.css";
import AdminLink from "@/components/ui/admin-link";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { ThemeProvider } from "next-themes";
import { Inter, Roboto_Flex } from "next/font/google";

const body = Inter({ subsets: ["latin"], variable: "--body-font" });
const heading = Roboto_Flex({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--heading-font",
});

export default function RootLayout({
  children = null,
}: {
  children: React.ReactNode;
}) {
  const isThemeSelectorEnabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_THEME_SELECTION === "true";
  const theme = process.env.NEXT_PUBLIC_TINA_THEME || "default";

  const content = (
    <>
      <AdminLink />
      <TailwindIndicator />
      {isThemeSelectorEnabled && <ThemeSelector />}
      <div className="font-sans flex min-h-screen flex-col bg-background-color">
        <div className="flex flex-1 flex-col items-center">{children}</div>
      </div>
    </>
  );

  return (
    <html lang="en" className={`theme-${theme}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${body.variable} ${heading.variable}`}>
        {isThemeSelectorEnabled ? (
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            {content}
          </ThemeProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
