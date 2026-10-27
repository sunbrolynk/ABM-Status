import { MaintenanceConfig, MonitorState, MonitorTarget } from '@/types/config'
import { date, has, t } from '@/util/i18n'

export type Level = 'ok' | 'good' | 'warn' | 'bad' | 'none'
export type Status = 'up' | 'degraded' | 'down' | 'maintenance'
export type Tone = 'ok' | 'degraded' | 'down'

export type Day = { start: number; level: Level; pct: number | null; downMin: number; reasons: string[] }

export type MonitorView = {
  id: string
  name: string
  link?: string
  endpoint?: string
  status: Status
  uptime: number
  latest: number | null
  avgPing: number | null
  days: Day[]
  streakSeconds: number
  lastError?: string
  downSince?: number
  recoveredAgoH?: number
  ageDays: number
}

export type ChronicleEvent = {
  kind: 'outage' | 'maintenance'
  title: string
  body?: string
  monitors: string[]
  start: number
  end: number | null
  reason?: string
  color?: string
}

export type Model = {
  monitors: MonitorView[]
  tone: Tone
  upCount: number
  total: number
  resting: MaintenanceConfig[]
  events: ChronicleEvent[]
}

const DAY = 86400
const overlap = (a1: number, a2: number, b1: number, b2: number) => Math.max(0, Math.min(a2, b2) - Math.max(a1, b1))

export function levelOf(pct: number | null): Level {
  if (pct === null || Number.isNaN(pct)) return 'none'
  if (pct >= 99.9) return 'ok'
  if (pct >= 99) return 'good'
  if (pct >= 95) return 'warn'
  return 'bad'
}

const clock = (sec: number) => date(sec * 1000, { hour: '2-digit', minute: '2-digit' })
// A monitor's name in the reader's language when the page has one for its id
const nameOf = (m: MonitorTarget) => (has(`monitor.${m.id}`) ? t(`monitor.${m.id}`) : m.name)

export function buildModel(
  state: MonitorState,
  monitors: MonitorTarget[],
  maintenances: MaintenanceConfig[],
  nowMs: number = Date.now()
): Model {
  const now = Math.round(nowMs / 1000)
  const midnight = new Date(nowMs)
  midnight.setHours(0, 0, 0, 0)
  const todayStart = Math.round(midnight.getTime() / 1000)

  const resting = maintenances.filter((m) => nowMs >= new Date(m.start).getTime() && (!m.end || nowMs <= new Date(m.end).getTime()))
  const restingIds = new Set(resting.flatMap((m) => m.monitors ?? []))

  const views: MonitorView[] = monitors
    .filter((m) => state.incident[m.id] && state.latency[m.id])
    .map((m) => {
      const incidents = state.incident[m.id]
      const born = incidents[0].start[0]
      const days: Day[] = []
      for (let i = 89; i >= 0; i--) {
        const start = todayStart - i * DAY
        const end = start + DAY
        const watched = overlap(start, end, born, now)
        let down = 0
        const reasons: string[] = []
        for (const inc of incidents) {
          const s = inc.start[0]
          const e = inc.end ?? now
          const o = overlap(start, end, s, e)
          down += o
          if (o > 0 && inc.error[0] !== 'dummy') {
            reasons.push(`${clock(Math.max(s, start))}-${clock(Math.min(e, end))} ${inc.error[inc.error.length - 1]}`)
          }
        }
        const pct = watched > 0 ? ((watched - down) / watched) * 100 : null
        days.push({ start, level: levelOf(pct), pct, downMin: Math.round(down / 60), reasons })
      }

      const total = now - born
      let downTotal = 0
      for (const inc of incidents) downTotal += (inc.end ?? now) - inc.start[0]
      const last = incidents[incidents.length - 1]
      const isDown = last.end === null
      // The first record is the monitor's own start marker, not an outage
      const recoveredAgo = !isDown && incidents.length > 1 ? now - (last.end as number) : Infinity
      const pings = state.latency[m.id].map((p) => p.ping).filter((p) => p > 0)
      const status: Status = restingIds.has(m.id) ? 'maintenance' : isDown ? 'down' : recoveredAgo < DAY ? 'degraded' : 'up'

      return {
        id: m.id,
        name: nameOf(m),
        link: m.statusPageLink,
        endpoint: m.endpoint,
        status,
        uptime: Math.round(((total - downTotal) / total) * 10000) / 100,
        latest: isDown ? null : pings[pings.length - 1] ?? null,
        avgPing: pings.length ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : null,
        days,
        streakSeconds: isDown ? 0 : now - (last.end as number),
        lastError: isDown ? last.error[last.error.length - 1] : undefined,
        downSince: isDown ? last.start[0] : undefined,
        recoveredAgoH: recoveredAgo < DAY ? Math.max(1, Math.round(recoveredAgo / 3600)) : undefined,
        ageDays: Math.floor(total / DAY),
      }
    })

  const nameById = (id: string) => { const m = monitors.find((x) => x.id === id); return m ? nameOf(m) : id }
  const events: ChronicleEvent[] = []
  for (const m of views) {
    for (const inc of state.incident[m.id]) {
      if (inc.error[0] === 'dummy') continue
      events.push({
        kind: 'outage',
        title: m.name,
        monitors: [m.name],
        start: inc.start[0] * 1000,
        end: inc.end === null ? null : inc.end * 1000,
        reason: inc.error[inc.error.length - 1],
      })
    }
  }
  for (const mt of maintenances) {
    events.push({
      kind: 'maintenance',
      title: mt.title ?? t('maint.default'),
      body: mt.body,
      monitors: (mt.monitors ?? []).map(nameById),
      start: new Date(mt.start).getTime(),
      end: mt.end ? new Date(mt.end).getTime() : null,
      color: mt.color,
    })
  }
  events.sort((a, b) => b.start - a.start)

  const downCount = views.filter((v) => v.status === 'down').length
  const degradedCount = views.filter((v) => v.status === 'degraded').length
  const tone: Tone = views.length > 0 && downCount === views.length ? 'down' : downCount + degradedCount > 0 ? 'degraded' : 'ok'
  return {
    monitors: views,
    tone,
    upCount: views.length - downCount,
    total: views.length,
    resting,
    events,
  }
}
