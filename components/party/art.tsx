import { ReactNode } from 'react'
import { PartyClass } from '@/util/partyClass'
import { t } from '@/util/i18n'

// Hand-drawn SVG: crystal ball, class badges and status icons. No external art.
export function CrystalBall({ tone }: { tone: 'ok' | 'degraded' | 'down' }) {
  return (
    <svg className="ball" data-tone={tone} viewBox="0 0 200 220" role="img" aria-label={t(`ball.label.${tone}`)}>
      <defs>
        <radialGradient id="glass" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="var(--ball-hi)" />
          <stop offset="0.55" stopColor="var(--ball-mid)" />
          <stop offset="1" stopColor="var(--ball-lo)" />
        </radialGradient>
        <clipPath id="inside"><circle cx="100" cy="95" r="78" /></clipPath>
      </defs>
      <path d="M52 196 L66 168 H134 L148 196 Z" className="ball-base" />
      <rect x="44" y="196" width="112" height="10" rx="2" className="ball-base" />
      <circle cx="100" cy="95" r="80" className="ball-glow" />
      <circle cx="100" cy="95" r="78" fill="url(#glass)" />
      <g clipPath="url(#inside)">
        <g className="ball-swirl">
          <path d="M40 110 C70 60 110 140 160 80" className="ball-wisp" />
          <path d="M45 135 C85 90 120 160 165 115" className="ball-wisp w2" />
        </g>
        <g className="ball-clouds">
          <ellipse cx="70" cy="95" rx="42" ry="22" />
          <ellipse cx="125" cy="105" rx="48" ry="26" />
          <ellipse cx="100" cy="75" rx="36" ry="18" />
        </g>
        <path className="ball-bolt" d="M104 40 L88 92 H108 L92 150 L130 82 H110 L124 40 Z" />
        <path className="ball-crack" d="M100 17 L92 50 L108 72 L90 100 L106 128 L96 172" />
        <g className="ball-stars">
          <circle cx="62" cy="70" r="2.4" /><circle cx="140" cy="62" r="2" /><circle cx="118" cy="132" r="2.6" /><circle cx="78" cy="128" r="1.8" /><circle cx="150" cy="104" r="1.8" />
        </g>
      </g>
      <ellipse cx="76" cy="52" rx="20" ry="9" transform="rotate(-30 76 52)" className="ball-shine" />
    </svg>
  )
}

const Shield = () => (<><path d="M12 2 L21 5 V12 C21 17 17 21 12 23 C7 21 3 17 3 12 V5 Z" /><path d="M12 6 V19" className="cut" /></>)
const Staff = () => (<><path d="M12 2 L14 6 L18 6 L15 9 L16 13 L12 11 L8 13 L9 9 L6 6 L10 6 Z" /><path d="M12 12 V23" className="cut" strokeWidth="2" /></>)
const Hat = () => (<><path d="M12 2 L17 16 H21 V19 H3 V16 H7 Z" /><path d="M8 14 H16" className="cut" /></>)
const Dagger = () => (<><path d="M12 1 L15 14 H9 Z" /><path d="M6 14 H18 V16 H6 Z" /><path d="M11 16 H13 V22 H11 Z" /></>)

const Lute = () => (<><path d="M14 3 L21 10 L19 12 L12 5 Z" /><circle cx="8" cy="16" r="6" /><path d="M11 13 L16 8" className="cut" strokeWidth="1.6" /></>)

const GLYPHS: Record<PartyClass, ReactNode> = {
  Paladin: <Shield />,
  Cleric: <Staff />,
  Mage: <Hat />,
  Rogue: <Dagger />,
  Bard: <Lute />,
}

export function Avatar({ cls, status }: { cls: PartyClass; status: string }) {
  return (
    <svg className="avatar" data-status={status} viewBox="0 0 24 24" aria-hidden="true">
      {GLYPHS[cls]}
    </svg>
  )
}

export function EffectIcon({ status }: { status: string }) {
  return (
    <svg className="effect-icon" viewBox="0 0 16 16" aria-hidden="true">
      {status === 'up' && <path d="M8 14 C2 9 1 5 3.5 3 C5.3 1.6 7.2 2.4 8 4 C8.8 2.4 10.7 1.6 12.5 3 C15 5 14 9 8 14Z" />}
      {status === 'degraded' && <path d="M8 1 C11 5 13 7.5 13 10 A5 5 0 0 1 3 10 C3 7.5 5 5 8 1Z" />}
      {status === 'down' && <path d="M8 1 C3.5 1 1.5 4 1.5 7 C1.5 9 2.5 10 3.5 10.5 V14 H6 V12 H7 V14 H9 V12 H10 V14 H12.5 V10.5 C13.5 10 14.5 9 14.5 7 C14.5 4 12.5 1 8 1Z M5 5.5 A1.6 1.6 0 1 1 5 8.7 A1.6 1.6 0 1 1 5 5.5Z M11 5.5 A1.6 1.6 0 1 1 11 8.7 A1.6 1.6 0 1 1 11 5.5Z" fillRule="evenodd" />}
      {status === 'maintenance' && <path d="M10 1 A6.5 6.5 0 1 0 15 11 A5.5 5.5 0 0 1 10 1Z" />}
    </svg>
  )
}
