import ThemeToggle from '@/components/ThemeToggle'
import { useWit } from '@/util/hooks'
import { t, tx } from '@/util/i18n'
import { FOOTER_KEYS } from './copy'

export function Footer() {
  const line = useWit(FOOTER_KEYS)
  return (
    <footer className="foot">
      <p className="wit">{t(line)}</p>
      <p>
        {tx('foot.credit', {
          abm: <a href="https://audiobookmanager.com">AudioBook Manager</a>,
          uptimeflare: <a href="https://github.com/lyc8503/UptimeFlare" target="_blank" rel="noreferrer">UptimeFlare</a>,
        })}
      </p>
      <ThemeToggle darkLabel={t('foot.night')} lightLabel={t('foot.day')} />
    </footer>
  )
}
