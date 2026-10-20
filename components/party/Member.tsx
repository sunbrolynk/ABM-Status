import { MonitorState, MonitorTarget } from '@/types/config'
import { MonitorView, STATUS_WORD } from '@/util/model'
import DayStrip from '@/components/DayStrip'
import Latency from '@/components/Latency'
import { classFor } from '@/util/partyClass'
import { Avatar, EffectIcon } from './art'
import { dayLine, EFFECT, flavour } from './copy'

export function Member({ m, index, state, monitor }: { m: MonitorView; index: number; state: MonitorState; monitor: MonitorTarget }) {
  const cls = classFor(m.id)
  const level = Math.max(1, Math.floor(m.ageDays / 10))
  const hp = m.status === 'down' ? 0 : m.uptime
  return (
    <li className="member" data-status={m.status}>
      <div className="member-top">
        <Avatar cls={cls} status={m.status} />
        <div className="member-id">
          <h3>{m.link ? <a href={m.link} target="_blank" rel="noreferrer">{m.name}</a> : m.name}</h3>
          <p className="class">Lv {level} {cls} <span className="ep">{m.endpoint}</span></p>
        </div>
        <p className="plate" data-status={m.status}>
          <EffectIcon status={m.status} />
          <span className="word">{STATUS_WORD[m.status]}</span>
          <span className="effect">{EFFECT[m.status]}</span>
        </p>
      </div>
      <div className="hp" role="img" aria-label={m.status === 'down' ? 'Health: knocked out' : `Health ${m.uptime}%`}>
        <span className="hp-label">HP</span>
        <span className="hp-bar"><b style={{ width: `${hp}%` }} /></span>
        <span className="hp-num">{m.status === 'down' ? '0 HP' : `${m.uptime}%`}</span>
      </div>
      <p className="flavour">{flavour(m, index)}</p>
      <DayStrip days={m.days} label={`${m.name} battle log`} describe={dayLine} />
      <div className="meta">
        <span>90-day uptime {m.uptime}%</span>
        <span>Reflexes {m.latest ? `${m.latest} ms` : '-'}</span>
        <span>Avg {m.avgPing ?? '-'} ms</span>
      </div>
      <Latency monitor={monitor} state={state} openLabel="Consult the scrying glass" closeLabel="Close the scrying glass" />
    </li>
  )
}
