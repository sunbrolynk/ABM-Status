import { createElement, Fragment, ReactNode } from 'react'
import cs from '@/locales/cs.json'
import da from '@/locales/da.json'
import de from '@/locales/de.json'
import en from '@/locales/en.json'
import enAu from '@/locales/en-au.json'
import enCa from '@/locales/en-ca.json'
import enGb from '@/locales/en-gb.json'
import es from '@/locales/es.json'
import fi from '@/locales/fi.json'
import fr from '@/locales/fr.json'
import it from '@/locales/it.json'
import ja from '@/locales/ja.json'
import ko from '@/locales/ko.json'
import nb from '@/locales/nb.json'
import nl from '@/locales/nl.json'
import pl from '@/locales/pl.json'
import ptBr from '@/locales/pt-br.json'
import sv from '@/locales/sv.json'
import uk from '@/locales/uk.json'
import zhCn from '@/locales/zh-cn.json'
import zhTw from '@/locales/zh-tw.json'

type Messages = Record<string, string>
type Vars = Record<string, string | number>

// The same 21 languages as audiobookmanager.com, keyed by the site's locale codes
export const MESSAGES: Record<string, Messages> = {
  cs, da, de, en, 'en-au': enAu, 'en-ca': enCa, 'en-gb': enGb, es, fi, fr, it, ja, ko, nb, nl, pl,
  'pt-br': ptBr, sv, uk, 'zh-cn': zhCn, 'zh-tw': zhTw,
}

// A browser language tag to one of the site's locales, or null when none fits
export function matchLocale(tag: string): string | null {
  const t = tag.toLowerCase()
  if (MESSAGES[t]) return t
  const [lang, ...rest] = t.split('-')
  if (lang === 'zh') return rest.some((p) => ['hant', 'tw', 'hk', 'mo'].includes(p)) ? 'zh-tw' : 'zh-cn'
  if (lang === 'no' || lang === 'nn') return 'nb'
  if (lang === 'pt') return 'pt-br'
  if (lang === 'en') return rest.includes('nz') ? 'en-au' : rest.some((p) => ['ie', 'za', 'in'].includes(p)) ? 'en-gb' : 'en'
  return MESSAGES[lang] ? lang : null
}

// The first browser language with a translation; Intl formats in that exact tag (de-AT, es-MX), so numbers and dates follow the reader's region
export function detect(languages: readonly (string | undefined)[]): { locale: string; tag: string } {
  for (const tag of languages) {
    const locale = tag && matchLocale(tag)
    if (tag && locale) return { locale, tag }
  }
  return { locale: 'en', tag: 'en' }
}

// English until setLocale runs in the browser; the server (a Cloudflare Worker) has no reader language
export let locale = 'en'
export let intlTag = 'en'
let messages: Messages = en
const base: Messages = en
let plurals = new Intl.PluralRules(intlTag)

// Switch to the reader's first translated language; call before rendering anything translated
export function setLocale(languages: readonly (string | undefined)[]): string {
  ;({ locale, tag: intlTag } = detect(languages))
  messages = MESSAGES[locale]
  plurals = new Intl.PluralRules(intlTag)
  return locale
}

function lookup(key: string, vars: Vars): string {
  if (typeof vars.count === 'number') {
    const k = `${key}.${plurals.select(vars.count)}`
    const hit = messages[k] ?? base[k] ?? messages[`${key}.other`]
    if (hit) return hit
  }
  return messages[key] ?? base[key] ?? key
}

const fill = (s: string, vars: Vars) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))

// A translated string with {name} filled from vars; a numeric `count` picks the plural form
export function t(key: string, vars: Vars = {}): string {
  const n = typeof vars.count === 'number' ? { ...vars, count: num(vars.count) } : vars
  return fill(lookup(key, vars), n)
}

export const has = (key: string) => key in messages || key in base

// Like t, but a var may be an element (a link, a quote), so the translation decides where it goes
export function tx(key: string, vars: Record<string, ReactNode>): ReactNode {
  const parts = lookup(key, {}).split(/\{(\w+)\}/)
  return createElement(Fragment, null, ...parts.map((p, i) => (i % 2 ? vars[p] ?? `{${p}}` : p)))
}

export const num = (n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(intlTag, opts).format(n)
export const pct = (n: number) => num(n / 100, { style: 'percent', maximumFractionDigits: 2 })
export const ms = (n: number) => num(n, { style: 'unit', unit: 'millisecond', unitDisplay: 'short' })
export const list = (items: string[]) => new Intl.ListFormat(intlTag, { type: 'conjunction' }).format(items)
export const date = (when: number | Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlTag, opts).format(when)
export const dateTime = (when: number | Date) => date(when, { dateStyle: 'medium', timeStyle: 'short' })
export const ago = (n: number, unit: Intl.RelativeTimeFormatUnit) => new Intl.RelativeTimeFormat(intlTag, { numeric: 'always' }).format(-n, unit)

// A span as its two largest units, e.g. "3 h 5 min" or "2 d 4 h"
export function duration(msSpan: number, unitDisplay: 'short' | 'long' = 'short'): string {
  const m = Math.max(1, Math.round(msSpan / 60000))
  const unit = (n: number, u: string) => num(n, { style: 'unit', unit: u, unitDisplay })
  const parts = m < 60 ? [unit(m, 'minute')] : m < 1440 ? [unit(Math.floor(m / 60), 'hour'), unit(m % 60, 'minute')] : [unit(Math.floor(m / 1440), 'day'), unit(Math.floor(m / 60) % 24, 'hour')]
  return new Intl.ListFormat(intlTag, { type: 'unit', style: 'narrow' }).format(parts)
}

if (process.env.NODE_ENV !== 'production') {
  const pick = (...tags: (string | undefined)[]) => detect(tags).locale
  console.assert(pick('de-AT') === 'de' && pick('pt-PT') === 'pt-br' && pick('nn-NO') === 'nb', 'regional tags reach their language')
  console.assert(pick('zh-Hant-HK') === 'zh-tw' && pick('zh-HK') === 'zh-tw' && pick('zh') === 'zh-cn', 'Chinese splits by script')
  console.assert(pick('en-NZ') === 'en-au' && pick('en-IE') === 'en-gb' && pick('en-US') === 'en', 'English variants keep their spelling')
  console.assert(pick('tr', 'fr-CA') === 'fr' && pick('tr') === 'en' && pick() === 'en', 'the first translated language wins, else English')
  console.assert(pick(undefined) === 'en' && pick(undefined, 'ja') === 'ja', 'a missing language is skipped, not a crash')
  console.assert(fill('{a} of {b}', { a: 1, b: 2 }) === '1 of 2' && fill('{x}', {}) === '{x}', 'placeholders fill, unknown ones stay')
}
