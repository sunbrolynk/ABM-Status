const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`

// How long a monitor has been up, in the largest whole unit; null under an hour, so the copy can say it just started
export function streakPhrase(seconds: number): string | null {
  const hours = Math.floor(seconds / 3600)
  if (hours < 1) return null
  return hours < 24 ? plural(hours, 'hour') : plural(Math.floor(hours / 24), 'day')
}

if (process.env.NODE_ENV !== 'production') {
  console.assert(streakPhrase(59 * 60) === null, 'under an hour has no phrase')
  console.assert(streakPhrase(3600) === '1 hour' && streakPhrase(14 * 3600 + 59) === '14 hours', 'hours pluralise')
  console.assert(streakPhrase(86400) === '1 day' && streakPhrase(63 * 86400) === '63 days', 'days pluralise')
  console.assert(streakPhrase(23 * 3600 + 3599) === '23 hours', 'a day is only reached at 24 hours')
}
