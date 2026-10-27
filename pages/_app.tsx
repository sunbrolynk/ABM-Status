import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { useEffect } from 'react'
import NoSsr from '@/components/NoSsr'
import { locale } from '@/util/i18n'
import '@/styles/fonts'
import '@/styles/party.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.lang = locale.replace(/-(\w+)$/, (_, region: string) => '-' + region.toUpperCase())
  }, [])
  return (
    <NoSsr>
      <MantineProvider defaultColorScheme="dark">
        <Component {...pageProps} />
      </MantineProvider>
    </NoSsr>
  )
}
