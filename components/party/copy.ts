import { Day, MonitorView, Status, Tone, fmtDuration } from '@/util/model'

export const EFFECT: Record<Status, string> = {
  up: 'Healthy',
  degraded: 'Recovering (poisoned)',
  down: 'Knocked out',
  maintenance: 'Resting at the inn',
}

export const BALL_LINES: Record<Tone, string[]> = {
  ok: [
    'The crystal ball is clear. The wizards are napping.',
    'Nothing is on fire. Checked twice, once with a lantern.',
    'All quiet. Suspiciously quiet. Enjoy it.',
    'The oracle reports: no dragons, no 503s.',
  ],
  degraded: [
    'The crystal ball has clouded over. A cleric is being fetched.',
    'Something is wrong, but the party is on it. Mostly with snacks.',
    'A wild error appeared. The party rolled for initiative.',
  ],
  down: [
    'The ball has gone dark. This is fine. (It is not fine.)',
    'Total party knockout. A bard is already composing the sad song.',
  ],
}

export const FOOTER_LINES = [
  'No bards were harmed in the making of this page.',
  'Roll for initiative. Then roll for a restart.',
  'This status page is 90% uptime and 10% dramatic lighting.',
  'The mimic in the corner is also a status page. Do not open it.',
  'Please keep all hands, tentacles and webhooks inside the party.',
  'It is not a bug. It is a lich with unfinished business.',
]

export const POKED_LINE = 'The ball says: have you tried turning it off and on again? Mage, please stop shaking the ball.'
export const SECRET_LINE = 'You found the secret level. It has no loot. Only uptime.'

export function dayLine(d: Day) {
  const date = new Date(d.start * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })
  if (d.pct === null) return `${date}: the party had not formed yet.`
  const quip = {
    ok: 'flawless victory.',
    good: 'a mere scratch.',
    warn: `took some hits (${d.downMin} min down).`,
    bad: `knocked out for ${d.downMin} min.`,
    none: '',
  }[d.level]
  return `${date}: ${d.pct.toFixed(2)}% HP, ${quip}${d.reasons.length ? ' ' + d.reasons.join('; ') : ''}`
}

export function flavour(m: MonitorView, index: number) {
  if (m.status === 'down') {
    const since = m.downSince ? ` for ${fmtDuration(Date.now() - m.downSince * 1000)}` : ''
    return `${m.name} is knocked out${since}. A cleric has been summoned. The chart says: ${m.lastError}.`
  }
  if (m.status === 'maintenance') return `${m.name} is resting at the inn. Please do not poke the sleeping party member.`
  if (m.status === 'degraded') return `${m.name} ate something questionable ${m.recoveredAgoH} h ago and is still a little green. Drinking a potion.`
  const lines = [
    `${m.name} has rolled a natural 20 on staying up for ${m.streak} days.`,
    `${m.name}: ${m.streak} days without a scratch. The bards are running out of rhymes.`,
    `${m.name} has been on its feet for ${m.streak} days. Nobody knows how, and nobody asks.`,
  ]
  return lines[index % lines.length]
}
