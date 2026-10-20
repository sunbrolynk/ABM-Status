import Link from 'next/link'
import { useState } from 'react'
import { MonitorState, MonitorTarget } from '@/types/config'
import { maintenances } from '@/uptime.config'
import { buildModel, fmtDuration } from '@/util/model'
import { useSecondsSince, useWit } from '@/util/hooks'
import { CrystalBall } from './art'
import { BALL_LINES, POKED_LINE } from './copy'
import { Footer } from './Footer'
import { Member } from './Member'
import { Shell } from './Shell'

export function Home({ state, monitors }: { state: MonitorState; monitors: MonitorTarget[] }) {
  const model = buildModel(state, monitors, maintenances)
  const age = useSecondsSince(state.lastUpdate)
  const line = useWit(BALL_LINES[model.tone])
  const [pokes, setPokes] = useState(0)

  if (state.lastUpdate === 0 || model.monitors.length === 0) {
    return (
      <Shell>
        <section className="hero" data-tone="ok">
          <div className="ball-static"><CrystalBall tone="ok" /></div>
          <div className="hero-text">
            <p className="eyebrow">Live scrying</p>
            <h1 className="verdict" data-tone="none">No data yet</h1>
            <p className="line">The party is still assembling. The first scry lands within a few minutes of the first worker run.</p>
          </div>
        </section>
        <Footer />
      </Shell>
    )
  }

  return (
    <Shell>
      <section className="hero" data-tone={model.tone}>
        <button type="button" className="ball-btn" onClick={() => setPokes(pokes + 1)} aria-label="Poke the crystal ball">
          <CrystalBall tone={model.tone} />
        </button>
        <div className="hero-text">
          <p className="eyebrow">Live scrying</p>
          <h1 className="verdict" data-tone={model.tone}><span className="sr">System status: </span>{model.word}</h1>
          <p className="line">{pokes >= 5 ? POKED_LINE : line}</p>
          <p className="sub">
            <span className="chip">{model.upCount} of {model.total} party members on their feet</span>
            <span>Last scried {age < 60 ? `${age} s` : `${Math.round(age / 60)} min`} ago</span>
          </p>
        </div>
      </section>

      {model.resting.map((r) => (
        <aside className="rest" key={r.title}>
          <h2>The party is taking a long rest</h2>
          <p><strong>{r.title}</strong>: {r.body}</p>
          <p className="until">Back on their feet {r.end ? new Date(r.end).toLocaleString() : 'when the dawn comes'}.</p>
        </aside>
      ))}

      <section aria-labelledby="roster">
        <h2 id="roster" className="section">The Party</h2>
        <ul className="roster">
          {model.monitors.map((m, i) => (
            <Member key={m.id} m={m} index={i} state={state} monitor={monitors.find((x) => x.id === m.id)!} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="quests">
        <h2 id="quests" className="section">Quest Log</h2>
        <ul className="quests">
          {model.events.slice(0, 3).map((e) => (
            <li key={e.start + e.title} data-kind={e.kind}>
              <span className="tag">{e.kind === 'outage' ? 'Battle' : 'Long rest'}</span>
              <span className="what">
                {e.kind === 'outage' ? `${e.title} was knocked out${e.end ? ` for ${fmtDuration(e.end - e.start)}` : ' and still is'}` : e.title}
              </span>
              <time>{new Date(e.start).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time>
            </li>
          ))}
        </ul>
        <Link className="more" href="/incidents">Open the full quest log</Link>
      </section>

      <Footer />
    </Shell>
  )
}
