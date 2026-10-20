import { useEffect, useRef, useState } from 'react'

// A line chosen once per page load, so it does not change on re-render
export function useWit<T>(items: T[]): T {
  const [item] = useState(() => items[Math.floor(Math.random() * items.length)])
  return item
}

function useInterval(fn: () => void, ms: number) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    const id = setInterval(() => ref.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

// Seconds since the worker last wrote state. Reloads a visible tab that has gone stale.
export function useSecondsSince(lastUpdate: number) {
  const [now, setNow] = useState(() => Math.round(Date.now() / 1000))
  const [opened] = useState(now)
  useInterval(() => {
    if (document.visibilityState !== 'visible') return
    const t = Math.round(Date.now() / 1000)
    if (t - lastUpdate > 300 && t - opened > 30) window.location.reload()
    setNow(t)
  }, 1000)
  return Math.max(0, now - lastUpdate)
}
