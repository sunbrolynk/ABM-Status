import { useState } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { Day } from '@/util/model'
import { num, t } from '@/util/i18n'

// 90 days of uptime as focusable, pointer-scrubbable segments. The look is all in styles/party.css.
export default function DayStrip({
  days,
  label,
  describe,
  className = 'strip',
}: {
  days: Day[]
  label: string
  describe: (day: Day) => string
  className?: string
}) {
  const narrow = useMediaQuery('(max-width: 560px)')
  const shown = narrow ? days.slice(-45) : days
  const [active, setActive] = useState<number | null>(null)

  const move = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setActive(Math.min(shown.length - 1, Math.max(0, Math.floor(((clientX - r.left) / r.width) * shown.length))))
  }
  const rough = shown.filter((d) => d.level === 'warn' || d.level === 'bad').length
  const summary = rough === 0 ? t('strip.calm', { count: shown.length }) : t('strip.rough', { count: rough, days: num(shown.length) })
  const day = active === null ? null : shown[active]

  return (
    <div className={className}>
      <div
        className={`${className}-bars`}
        role="group"
        aria-label={t('strip.label', { label, summary })}
        tabIndex={0}
        onPointerMove={(e) => move(e.clientX, e.currentTarget)}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setActive(Math.max(0, (active ?? shown.length) - 1))
          else if (e.key === 'ArrowRight') setActive(Math.min(shown.length - 1, (active ?? -1) + 1))
          else if (e.key === 'Escape') setActive(null)
          else return
          e.preventDefault()
        }}
      >
        {shown.map((d, i) => (
          <i key={d.start} data-level={d.level} data-active={i === active || undefined} />
        ))}
      </div>
      <p className={`${className}-readout`} aria-live="polite">
        {day ? describe(day) : summary}
      </p>
    </div>
  )
}
