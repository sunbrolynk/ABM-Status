import Link from 'next/link'
import { useState } from 'react'
import { MonitorState, MonitorTarget } from '@/types/config'
import { maintenances } from '@/uptime.config'
import { buildModel } from '@/util/model'
import { ago, date, dateTime, duration, num, t } from '@/util/i18n'
import { useSecondsSince, useWit } from '@/util/hooks'
import { CrystalBall } from './art'
import { BALL_KEYS } from './copy'
import { Footer } from './Footer'
import { Member } from './Member'
import { Shell } from './Shell'

export function Home({ state, monitors }: { state: MonitorState; monitors: MonitorTarget[] }) {
  const model = buildModel(state, monitors, maintenances)
  const age = useSecondsSince(state.lastUpdate)
  const line = useWit(BALL_KEYS[model.tone])
  const [pokes, setPokes] = useState(0)

  if (state.lastUpdate === 0 || model.monitors.length === 0) {
    return (
      <Shell>
        <section className="hero" data-tone="ok">
          <div className="ball-static"><CrystalBall tone="ok" /></div>
          <div className="hero-text">
            <p className="eyebrow">{t('home.eyebrow')}</p>
            <h1 className="verdict" data-tone="none">{t('home.empty.title')}</h1>
            <p className="line">{t('home.empty.line')}</p>
          </div>
        </section>
        <Footer />
      </Shell>
    )
  }

  return (
    <Shell>
      <section className="hero" data-tone={model.tone}>
        <button type="button" className="ball-btn" onClick={() => setPokes(pokes + 1)} aria-label={t('home.poke')}>
          <CrystalBall tone={model.tone} />
        </button>
        <div className="hero-text">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="verdict" data-tone={model.tone}><span className="sr">{t('home.srStatus')} </span>{t(`status.${model.tone === 'ok' ? 'up' : model.tone}`)}</h1>
          <p className="line">{pokes >= 5 ? t('ball.poked') : t(line)}</p>
          <p className="sub">
            <span className="chip">{t('home.onFeet', { up: num(model.upCount), count: model.total })}</span>
            <span>{t('home.scried', { ago: age < 60 ? ago(age, 'second') : ago(Math.round(age / 60), 'minute') })}</span>
          </p>
        </div>
      </section>

      {model.resting.map((r) => (
        <aside className="rest" key={r.title}>
          <h2>{t('home.rest.title')}</h2>
          <p><strong>{r.title}</strong>: {r.body}</p>
          <p className="until">{r.end ? t('home.rest.until', { when: dateTime(new Date(r.end)) }) : t('home.rest.dawn')}</p>
        </aside>
      ))}

      <section aria-labelledby="roster">
        <h2 id="roster" className="section">{t('home.party')}</h2>
        <ul className="roster">
          {model.monitors.map((m, i) => (
            <Member key={m.id} m={m} index={i} state={state} monitor={monitors.find((x) => x.id === m.id)!} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="quests">
        <h2 id="quests" className="section">{t('home.quests')}</h2>
        <ul className="quests">
          {model.events.slice(0, 3).map((e) => (
            <li key={e.start + e.title} data-kind={e.kind}>
              <span className="tag">{t(e.kind === 'outage' ? 'quest.battle' : 'quest.rest')}</span>
              <span className="what">
                {e.kind === 'outage' ? (e.end ? t('quest.outFor', { name: e.title, duration: duration(e.end - e.start) }) : t('quest.outStill', { name: e.title })) : e.title}
              </span>
              <time>{date(e.start, { month: 'short', day: 'numeric' })}</time>
            </li>
          ))}
        </ul>
        <Link className="more" href="/incidents">{t('home.more')}</Link>
      </section>

      <Footer />
    </Shell>
  )
}
