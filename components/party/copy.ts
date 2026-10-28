import { ago, date, duration, pct, t } from '@/util/i18n'
import { streakPhrase } from '@/util/streak'
import { Day, MonitorView, Tone } from '@/util/model'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const COUNTS: Record<Tone, number> = { ok: 4, degraded: 3, down: 2 }

export const BALL_KEYS: Record<Tone, string[]> = {
  ok: range(COUNTS.ok).map((i) => `ball.ok.${i}`),
  degraded: range(COUNTS.degraded).map((i) => `ball.degraded.${i}`),
  down: range(COUNTS.down).map((i) => `ball.down.${i}`),
}
export const FOOTER_KEYS = range(6).map((i) => `foot.wit.${i}`)

export function dayLine(d: Day) {
  const when = date(d.start * 1000, { month: 'short', day: 'numeric' })
  if (d.pct === null || d.level === 'none') return t('day.unformed', { date: when })
  const down = duration(d.downMin * 60000)
  const line = t(`day.${d.level}`, { date: when, pct: pct(d.pct), down })
  return d.reasons.length ? `${line} ${d.reasons.join('; ')}` : line
}

export function flavour(m: MonitorView, index: number) {
  const name = m.name
  if (m.status === 'down') {
    const error = m.lastError ?? ''
    return m.downSince ? t('flavour.downFor', { name, error, duration: duration(Date.now() - m.downSince * 1000) }) : t('flavour.down', { name, error })
  }
  if (m.status === 'maintenance') return t('flavour.rest', { name })
  if (m.status === 'degraded') return t('flavour.degraded', { name, ago: ago(m.recoveredAgoH ?? 1, 'hour') })
  const streak = streakPhrase(m.streakSeconds)
  if (streak === null) return t('flavour.fresh', { name })
  return t(`flavour.streak.${index % 3}`, { name, streak })
}
