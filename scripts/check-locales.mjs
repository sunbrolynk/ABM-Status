#!/usr/bin/env node
// Fails when a translation lacks an English key, has a key English doesn't, changes a {placeholder},
// or misses a plural form its language needs (Intl.PluralRules decides which forms those are).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(import.meta.dirname, '..', 'locales')
const read = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))
const en = read('en.json')
const PLURAL = /\.(zero|one|two|few|many|other)$/
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')

const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'en.json')
if (files.length !== 20) console.error(`Expected 20 translations beside English, found ${files.length}.`)
let bad = files.length !== 20

for (const file of files) {
  const code = file.slice(0, -5)
  const msgs = read(file)
  const problems = []
  const tag = code.replace(/-(\w+)$/, (_, r) => '-' + r.toUpperCase())
  const forms = new Intl.PluralRules(tag).resolvedOptions().pluralCategories
  const bases = new Set(Object.keys(en).filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, '')))
  const want = new Set(Object.keys(en).filter((k) => !PLURAL.test(k)))
  for (const b of bases) for (const f of forms) want.add(`${b}.${f}`)
  for (const k of want) {
    if (!(k in msgs)) problems.push(`missing ${k}`)
    else if (typeof msgs[k] !== 'string' || !msgs[k].trim()) problems.push(`empty ${k}`)
    else {
      const ref = en[k] ?? en[k.replace(PLURAL, '.other')]
      if (vars(msgs[k]) !== vars(ref)) problems.push(`${k} has {${vars(msgs[k])}} where English has {${vars(ref)}}`)
    }
  }
  for (const k of Object.keys(msgs)) if (!want.has(k)) problems.push(`unexpected ${k}`)
  if (problems.length) {
    bad = true
    console.error(`${file}:\n  ${problems.join('\n  ')}`)
  }
}
if (bad) process.exit(1)
console.log(`All ${files.length} translations match English.`)
