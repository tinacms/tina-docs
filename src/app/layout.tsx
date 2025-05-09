import '@/styles/global.css'
import AdminLink from '@/src/components/ui/admin-link'
import { TailwindIndicator } from '@/components/ui/tailwind-indicator'

export default function RootLayout({
  children = null,
}: {
  children: React.ReactNode
}) {
  const theme = process.env.NEXT_PUBLIC_TINA_THEME || 'default'
  console.log(theme);
  
  return (
    <html lang="en" className={`theme-${theme} dark`}>
      <head>
        <meta name="theme-color" content="#E6FAF8" />
        <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
      </head>
      <body>
        <AdminLink />
        <TailwindIndicator />
        <div className="font-sans flex min-h-screen flex-col brand-background-gradient">
          <div className="flex flex-1 flex-col items-center">{children}</div>
        </div>
      </body>
    </html>
  )
}
