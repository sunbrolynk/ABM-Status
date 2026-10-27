import Link from 'next/link'
import { MonitorState, MonitorTarget } from '@/types/config'
import { maintenances } from '@/uptime.config'
import { buildModel, ChronicleEvent, fmtDuration } from '@/util/model'
import { Footer } from './Footer'
import { Shell } from './Shell'

const month = (ms: number) => new Date(ms).toLocaleDateString([], { month: 'long', year: 'numeric' })

function Entry({ e }: { e: ChronicleEvent }) {
  const when = `${new Date(e.start).toLocaleString()}${e.end ? ` to ${new Date(e.end).toLocaleString()}` : ''}`
  if (e.kind === 'maintenance') {
    return (
      <li className="chron" data-kind="rest">
        <p className="chron-tag"><span>Maintenance</span> Long rest</p>
        <h3>{e.title}</h3>
        <p>{e.body}</p>
        <p className="chron-meta">{when}. Party members resting: {e.monitors.join(', ') || 'everyone'}.</p>
      </li>
    )
  }
  return (
    <li className="chron" data-kind="battle">
      <p className="chron-tag"><span>{e.end ? 'Resolved' : 'Down'}</span> Battle</p>
      <h3>{e.title} was knocked out{e.end ? ` for ${fmtDuration(e.end - e.start)}` : ' and has not got up yet'}</h3>
      <p>The goblin responsible left a note: <q>{e.reason}</q>.</p>
      <p className="chron-meta">{when}.</p>
    </li>
  )
}

export function Chronicle({ state, monitors }: { state: MonitorState; monitors: MonitorTarget[] }) {
  const { events } = buildModel(state, monitors, maintenances)
  const chapters = events.reduce<Record<string, ChronicleEvent[]>>((acc, e) => ((acc[month(e.start)] ??= []).push(e), acc), {})
  return (
    <Shell>
      <h1 className="section big">The Quest Log</h1>
      <p className="lede">A chronicle of battles fought, naps taken, and the occasional goblin.</p>
      {events.length === 0 && <p className="chron" data-kind="rest">No quests on record. The bards are bored.</p>}
      {Object.entries(chapters).map(([name, list]) => (
        <section key={name}>
          <h2 className="section">Chapter: {name}</h2>
          <ol className="chronicle">{list.map((e) => <Entry key={e.start + e.title} e={e} />)}</ol>
        </section>
      ))}
      <p><Link className="more" href="/">Back to the party</Link></p>
      <Footer />
    </Shell>
  )
}
