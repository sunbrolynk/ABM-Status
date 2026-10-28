import { num } from '@/util/i18n'

const unit = (n: number, u: string) => num(n, { style: 'unit', unit: u, unitDisplay: 'long' })

// How long a monitor has been up, in the largest whole unit; null under an hour, so the copy can say it just started
export function streakPhrase(seconds: number): string | null {
  const hours = Math.floor(seconds / 3600)
  if (hours < 1) return null
  return hours < 24 ? unit(hours, 'hour') : unit(Math.floor(hours / 24), 'day')
}

if (process.env.NODE_ENV !== 'production') {
  console.assert(streakPhrase(59 * 60) === null, 'under an hour has no phrase')
  console.assert(streakPhrase(14 * 3600 + 59) === unit(14, 'hour'), 'hours count whole hours')
  console.assert(streakPhrase(63 * 86400) === unit(63, 'day'), 'days count whole days')
  console.assert(streakPhrase(23 * 3600 + 3599) === unit(23, 'hour'), 'a day is only reached at 24 hours')
}
