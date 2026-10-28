import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { useEffect, useState } from 'react'
import { setLocale } from '@/util/i18n'
import '@/styles/fonts'
import '@/styles/party.css'

export default function App({ Component, pageProps }: AppProps) {
  // Nothing renders until the reader's language is set, so the server and first client render match
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const locale = setLocale(navigator.languages?.length ? navigator.languages : [navigator.language])
    document.documentElement.lang = locale.replace(/-(\w+)$/, (_, region: string) => '-' + region.toUpperCase())
    setReady(true)
  }, [])
  if (!ready) return null
  return (
    <MantineProvider defaultColorScheme="dark">
      <Component {...pageProps} />
    </MantineProvider>
  )
}
