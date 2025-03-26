'use client'

import { useEffect, useState } from 'react'
import { client } from '../tina/__generated__/client'

type Props = {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: Props) => {
  useEffect(() => {
    const fetchTheme = async () => {
      const data = await client.queries.GlobalSiteColours({
        relativePath: 'global-site-colors.mdx',
      })
      
      console.log(data)
      const primaryStart = data?.data?.GlobalSiteColours?.primaryColour?.primaryStart
      const primaryVia = data?.data?.GlobalSiteColours?.primaryColour?.primaryVia
      const primaryEnd = data?.data?.GlobalSiteColours?.primaryColour?.primaryEnd

      document.documentElement.style.setProperty('--primary-color-start', primaryStart || '--primary-color-start')
      document.documentElement.style.setProperty('--primary-color-via', primaryVia || '--primary-color-via')
      document.documentElement.style.setProperty('--primary-color-end', primaryEnd || '--primary-color-end')
    }

    fetchTheme()
  }, [])

  return <>{children}</>
}
