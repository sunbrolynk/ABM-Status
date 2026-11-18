import Head from 'next/head'
import { MonitorTarget } from '@/types/config'
import { pageConfig } from '@/uptime.config'
import { t } from '@/util/i18n'
import { CompactedMonitorStateWrapper, getFromStore } from '@/worker/src/store'
import { Chronicle } from '@/components/party'

export const runtime = 'experimental-edge'

export default function Page({
  compactedStateStr,
  monitors,
  graceMin,
}: {
  compactedStateStr: string
  monitors: MonitorTarget[]
  graceMin: number | null
}) {
  const state = new CompactedMonitorStateWrapper(compactedStateStr).uncompact()
  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>
      <Chronicle state={state} monitors={monitors} graceMin={graceMin ?? undefined} />
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
    ...(monitor.slowMs ? { slowMs: monitor.slowMs } : {}),
  }))
  // Props must be JSON, so an unset grace period travels as null
  return { props: { compactedStateStr, monitors, graceMin: workerConfig.notification?.gracePeriod ?? null } }
}
