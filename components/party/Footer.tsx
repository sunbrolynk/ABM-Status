import ThemeToggle from '@/components/ThemeToggle'
import { useWit } from '@/util/hooks'
import { FOOTER_LINES } from './copy'

export function Footer() {
  const line = useWit(FOOTER_LINES)
  return (
    <footer className="foot">
      <p className="wit">{line}</p>
      <p>
        Status for <a href="https://audiobookmanager.com">AudioBook Manager</a>, powered by{' '}
        <a href="https://github.com/lyc8503/UptimeFlare" target="_blank" rel="noreferrer">UptimeFlare</a>.
      </p>
      <ThemeToggle darkLabel="Switch to night mode" lightLabel="Switch to daylight" />
    </footer>
  )
}
