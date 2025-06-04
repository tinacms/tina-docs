import "@/styles/global.css";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import AdminLink from "@/src/components/ui/admin-link";
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
  const theme = process.env.NEXT_PUBLIC_TINA_THEME || "default";

  return (
    <html lang="en" className={`theme-${theme}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={`${body.variable} ${heading.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <AdminLink />
          <TailwindIndicator />
          <div className="font-sans flex min-h-screen flex-col bg-background-color">
            <div className="flex flex-1 flex-col items-center">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
