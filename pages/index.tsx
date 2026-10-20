import Head from 'next/head'
import { MonitorTarget } from '@/types/config'
import { pageConfig } from '@/uptime.config'
import { CompactedMonitorStateWrapper, getFromStore } from '@/worker/src/store'
import { Home } from '@/components/party'

export const runtime = 'experimental-edge'

export default function Page({ compactedStateStr, monitors }: { compactedStateStr: string; monitors: MonitorTarget[] }) {
  const state = new CompactedMonitorStateWrapper(compactedStateStr).uncompact()
  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>
      <Home state={state} monitors={monitors} />
    </>
  )
}

export async function getServerSideProps() {
  const { workerConfig } = await import('@/uptime.config')
  // Read state as a string from storage, to stay inside the server-side cpu limit
  const compactedStateStr = await getFromStore(process.env as any, 'state')
  const monitors = workerConfig.monitors.map((monitor) => ({
    id: monitor.id,
    name: monitor.name,
    endpoint: `${monitor.method} ${new URL(monitor.target).pathname}`,
    // @ts-ignore
    statusPageLink: monitor?.statusPageLink ?? null,
  }))
  return { props: { compactedStateStr, monitors } }
}
