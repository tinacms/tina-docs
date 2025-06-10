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
  return (
    <html lang="en" className="theme-default" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${body.variable} ${heading.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="default"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AdminLink />
          <TailwindIndicator />
          <ThemeSelector />
          <div className="font-sans flex min-h-screen flex-col bg-background-color">
            <div className="flex flex-1 flex-col items-center">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
