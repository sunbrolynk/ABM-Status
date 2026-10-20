import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { pageConfig } from '@/uptime.config'
import { SECRET_LINE } from './copy'

export function Shell({ children }: { children: ReactNode }) {
  const [taps, setTaps] = useState(0)
  const links = [{ label: 'Quest log', link: '/incidents' }, ...(pageConfig.links ?? [])]
  return (
    <div className="world">
      <a className="skip" href="#main">Skip to the party</a>
      <header className="top">
        <Link className="brand" href="/" onClick={(e) => { if (taps < 2) { e.preventDefault(); setTaps(taps + 1) } }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a static logo; next/image needs an image loader this deploy lacks */}
          <img src={pageConfig.logo} alt="" width="36" height="36" />
          <span>The Uptime Party</span>
        </Link>
        <nav aria-label="Site">
          {links.map((l) => (
            <a key={l.link} href={l.link} data-hl={l.highlight || undefined} target={l.link.startsWith('/') ? undefined : '_blank'} rel="noreferrer">{l.label}</a>
          ))}
        </nav>
      </header>
      {taps >= 2 && <p className="secret" role="status">{SECRET_LINE}</p>}
      <main id="main">{children}</main>
    </div>
  )
}
