import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { pageConfig } from '@/uptime.config'
import { has, t } from '@/util/i18n'

export function Shell({ children }: { children: ReactNode }) {
  const [taps, setTaps] = useState(0)
  const links = [{ label: t('shell.questLog'), link: '/incidents' }, ...(pageConfig.links ?? []).map((l) => (has(`link.${l.label}`) ? { ...l, label: t(`link.${l.label}`) } : l))]
  return (
    <div className="world">
      <a className="skip" href="#main">{t('shell.skip')}</a>
      <header className="top">
        <Link className="brand" href="/" onClick={(e) => { if (taps < 2) { e.preventDefault(); setTaps(taps + 1) } }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a static logo; next/image needs an image loader this deploy lacks */}
          <img src={pageConfig.logo} alt="" width="36" height="36" />
          <span>{t('shell.brand')}</span>
        </Link>
        <nav aria-label={t('shell.nav')}>
          {links.map((l) => (
            <a key={l.link} href={l.link} data-hl={l.highlight || undefined} target={l.link.startsWith('/') ? undefined : '_blank'} rel="noreferrer">{l.label}</a>
          ))}
        </nav>
      </header>
      {taps >= 2 && <p className="secret" role="status">{t('shell.secret')}</p>}
      <main id="main">{children}</main>
    </div>
  )
}
