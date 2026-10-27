import Link from 'next/link'
import { MonitorState, MonitorTarget } from '@/types/config'
import { maintenances } from '@/uptime.config'
import { buildModel, ChronicleEvent } from '@/util/model'
import { date, dateTime, duration, list, t, tx } from '@/util/i18n'
import { Footer } from './Footer'
import { Shell } from './Shell'

const month = (ms: number) => date(ms, { month: 'long', year: 'numeric' })

function Entry({ e }: { e: ChronicleEvent }) {
  const when = e.end ? t('chron.span', { start: dateTime(e.start), end: dateTime(e.end) }) : dateTime(e.start)
  if (e.kind === 'maintenance') {
    return (
      <li className="chron" data-kind="rest">
        <p className="chron-tag"><span>{t('chron.maintenance')}</span> {t('quest.rest')}</p>
        <h3>{e.title}</h3>
        <p>{e.body}</p>
        <p className="chron-meta">{t('chron.resting', { when, who: e.monitors.length ? list(e.monitors) : t('chron.everyone') })}</p>
      </li>
    )
  }
  return (
    <li className="chron" data-kind="battle">
      <p className="chron-tag"><span>{e.end ? t('chron.resolved') : t('status.down')}</span> {t('quest.battle')}</p>
      <h3>{e.end ? t('quest.outFor', { name: e.title, duration: duration(e.end - e.start) }) : t('chron.outStill', { name: e.title })}</h3>
      <p>{tx('chron.goblin', { reason: <q>{e.reason}</q> })}</p>
      <p className="chron-meta">{t('chron.when', { when })}</p>
    </li>
  )
}

export function Chronicle({ state, monitors }: { state: MonitorState; monitors: MonitorTarget[] }) {
  const { events } = buildModel(state, monitors, maintenances)
  const chapters = events.reduce<Record<string, ChronicleEvent[]>>((acc, e) => ((acc[month(e.start)] ??= []).push(e), acc), {})
  return (
    <Shell>
      <h1 className="section big">{t('chron.title')}</h1>
      <p className="lede">{t('chron.lede')}</p>
      {events.length === 0 && <p className="chron" data-kind="rest">{t('chron.empty')}</p>}
      {Object.entries(chapters).map(([name, list]) => (
        <section key={name}>
          <h2 className="section">{t('chron.chapter', { month: name })}</h2>
          <ol className="chronicle">{list.map((e) => <Entry key={e.start + e.title} e={e} />)}</ol>
        </section>
      ))}
      <p><Link className="more" href="/">{t('chron.back')}</Link></p>
      <Footer />
    </Shell>
  )
}
