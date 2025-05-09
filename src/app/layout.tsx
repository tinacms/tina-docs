import '@/styles/global.css'
import AdminLink from '@/src/components/ui/admin-link'
import { TailwindIndicator } from '@/components/ui/tailwind-indicator'

function getThemeFromFile() {
  try {
    const fs = require('fs')
    const path = require('path')
    const file = fs?.readFileSync(path.join(process.cwd(), '.theme.json'), 'utf-8')
    return JSON.parse(file).theme || 'default'
  } catch {
    return 'default'
  }
}

export default function RootLayout({
  children = null,
}: {
  children: React.ReactNode
}) {
  const theme = getThemeFromFile()
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
