import { MonitorState, MonitorTarget } from '@/types/config'
import { MonitorView } from '@/util/model'
import { ms, num, pct, t } from '@/util/i18n'
import DayStrip from '@/components/DayStrip'
import Latency from '@/components/Latency'
import { classFor } from '@/util/partyClass'
import { Avatar, EffectIcon } from './art'
import { dayLine, flavour } from './copy'

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
          <p className="class">{t('member.level', { level: num(level), class: t(`class.${cls}`) })} <span className="ep">{m.endpoint}</span></p>
        </div>
        <p className="plate" data-status={m.status}>
          <EffectIcon status={m.status} />
          <span className="word">{t(`status.${m.status}`)}</span>
          <span className="effect">{t(`effect.${m.status}`)}</span>
        </p>
      </div>
      <div className="hp" role="img" aria-label={m.status === 'down' ? t('member.healthOut') : t('member.health', { pct: pct(m.uptime) })}>
        <span className="hp-label">{t('member.hp')}</span>
        <span className="hp-bar"><b style={{ width: `${hp}%` }} /></span>
        <span className="hp-num">{m.status === 'down' ? t('member.hpZero') : pct(m.uptime)}</span>
      </div>
      <p className="flavour">{flavour(m, index)}</p>
      <DayStrip days={m.days} label={t('member.log', { name: m.name })} describe={dayLine} />
      <div className="meta">
        <span>{t('member.uptime', { pct: pct(m.uptime) })}</span>
        <span>{t('member.reflexes', { ms: m.latest ? ms(m.latest) : '-' })}</span>
        <span>{t('member.avg', { ms: m.avgPing === null ? '-' : ms(m.avgPing) })}</span>
      </div>
      <Latency monitor={{ ...monitor, name: m.name }} state={state} openLabel={t('member.glassOpen')} closeLabel={t('member.glassClose')} />
    </li>
  )
}
