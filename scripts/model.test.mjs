import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'

const root = join(import.meta.dirname, '..')

// The store's hex helpers are in Workers and new browsers but not every Node, so they're filled
// in from Buffer when missing
Uint8Array.prototype.toHex ??= function () { return Buffer.from(this).toString('hex') }
Uint8Array.fromHex ??= (hex) => new Uint8Array(Buffer.from(hex, 'hex'))

// Loads a repo module by its `@/` or relative path, transpiled to CommonJS. The page's i18n is
// stubbed, since it pulls in the locale files and the browser; names and dates don't matter here.
const stubs = { '@/util/i18n': { t: (k) => k, has: () => false, date: () => '' } }
const cache = {}
function load(spec, from = root) {
  if (stubs[spec]) return stubs[spec]
  const file = spec.startsWith('@/') ? join(root, spec.slice(2)) : join(from, spec)
  const path = file.endsWith('.ts') ? file : file + '.ts'
  if (cache[path]) return cache[path].exports
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  })
  const mod = (cache[path] = { exports: {} })
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, (s) => load(s, dirname(path)))
  return mod.exports
}
const { buildModel, SLOW_MS } = load('@/util/model')
const { isOutage } = load('@/util/outage')
const { downAlertDue, upAlertDue } = load('@/worker/src/alerts')
const { CompactedMonitorStateWrapper } = load('@/worker/src/store')
const { workerConfig } = load('@/uptime.config')
const grace = workerConfig.notification.gracePeriod

const now = 1_800_000_000
const born = now - 10 * 86400
const marker = { start: [born], end: born, error: ['dummy'] }

// A state as of the check at `now`, with readings a few minutes apart.
function view(incidents, pings = [400, 420], monitor = {}, grace = 3) {
  const state = {
    lastUpdate: now,
    overallUp: 1,
    overallDown: 0,
    incident: { m: [marker, ...incidents] },
    latency: {
      m: pings.map((ping, i) => ({ loc: 'DEN', ping, time: now - (pings.length - 1 - i) * 180 })),
    },
  }
  const model = buildModel(
    state,
    [{ id: 'm', name: 'M', ...monitor }],
    [],
    grace ?? undefined,
    now * 1000
  )
  return { v: model.monitors[0], events: model.events }
}
const failingFor = (sec, error = 'Timeout after 10000ms') => ({
  start: [now - sec],
  end: null,
  error: [error],
})
const failing = (sinceMin, error) => failingFor(sinceMin * 60, error)
const failedFor = (sec, ago = 3600) => ({
  start: [now - ago],
  end: now - ago + sec,
  error: ['HTTP 502'],
})
const failed = (atMin, forMin) => failedFor(forMin * 60, atMin * 60)

test('a failure still inside the grace period shows as up, with nothing logged', () => {
  const { v, events } = view([failing(2)], [400, 10000])
  assert.equal(v.status, 'up')
  assert.equal(events.length, 0)
  assert.equal(v.uptime, 100)
  assert.equal(v.latest, null)
})

test('a failure that reaches 3 minutes is down and logged from its first failed check', () => {
  const { v, events } = view([failing(3)], [400, 10000])
  assert.equal(v.status, 'down')
  assert.equal(events.length, 1)
  assert.equal(events[0].start, (now - 180) * 1000)
})

test('an open failure becomes an outage at 150 s, with drift slack', () => {
  assert.equal(view([failingFor(149)], [400, 10000]).v.status, 'up')
  assert.equal(view([failingFor(150)], [400, 10000]).v.status, 'down')
})

test('a closed failure stays an outage from 210 s, when its down alert went out', () => {
  assert.equal(view([failedFor(209)]).events.length, 0)
  assert.equal(view([failedFor(210)]).events.length, 1)
})

test('a failure that recovered before 3 minutes leaves no mark', () => {
  const { v, events } = view([failed(60, 3), failed(30, 1)])
  assert.equal(v.status, 'up')
  assert.equal(events.length, 0)
  assert.equal(v.uptime, 100)
  assert.ok(v.days.every((d) => d.pct === null || d.pct === 100))
})

test('a failure that lasted 4 minutes stays in the log and the bars', () => {
  const { v, events } = view([failed(60, 4)])
  assert.equal(v.status, 'up')
  assert.equal(events.length, 1)
  assert.ok(v.uptime < 100)
})

test('with no grace period every failure counts', () => {
  assert.equal(view([failing(0)], [400, 10000], {}, null).v.status, 'down')
})

test('one slow reading is jitter, two in a row are degraded', () => {
  assert.equal(view([], [8000]).v.status, 'up')
  assert.equal(view([], [400, 400, 8000]).v.status, 'up')
  assert.equal(view([], [400, 3500, 8000]).v.status, 'degraded')
  assert.equal(view([], [400, 2900, 2900]).v.status, 'up')
})

test('slow means over the limit, not at it', () => {
  assert.equal(view([], [SLOW_MS, SLOW_MS]).v.status, 'up')
  assert.equal(view([], [SLOW_MS + 1, SLOW_MS + 1]).v.status, 'degraded')
})

test('a monitor can set its own slow threshold', () => {
  assert.equal(view([], [5, 300, 300], { slowMs: 200 }).v.status, 'degraded')
  assert.equal(view([], [4000, 4000], { slowMs: 5000 }).v.status, 'up')
})

test('a failure inside the grace period never reads as slow', () => {
  assert.equal(view([failing(1, 'HTTP 502')], [10000, 10000]).v.status, 'up')
})

test("a blip's timeout reading doesn't count toward slow once it clears", () => {
  // Readings at -3 min (the blip's timeout) and now; the blip ended 2 minutes ago
  assert.equal(view([failedFor(60, 180)], [10000, 6000], { slowMs: 5000 }).v.status, 'up')
  assert.equal(view([failedFor(60, 600)], [6000, 6000], { slowMs: 5000 }).v.status, 'degraded')
  // The check that recovers is stored at the failure's end and counts
  assert.equal(view([failedFor(60, 240)], [10000, 6000, 6000], { slowMs: 5000 }).v.status, 'degraded')
})

// One check a minute: a failure of `minutes` checks, then a recovery. At every check the page must
// count the failure as an outage exactly when the worker has sent its down alert, and once it
// clears, keep it exactly when the worker sent a recovery alert.
test('the page counts an outage exactly when the worker alerts for it', () => {
  for (let minutes = 1; minutes <= 8; minutes++) {
    const start = 1_800_000_000
    const inc = { start: [start], end: null, error: ['HTTP 502'] }
    let alerted = false
    for (let m = 0; m < minutes; m++) {
      const t = start + m * 60
      if (downAlertDue(inc, t, m === 0, 3, true)) alerted = true
      assert.equal(isOutage(inc, t, 3), alerted, `${minutes} min failing, check ${m}`)
    }
    const end = start + minutes * 60
    const recovered = upAlertDue(inc, end, 3)
    assert.equal(recovered, alerted, `${minutes} min: recovery follows a down alert`)
    assert.equal(isOutage({ ...inc, end }, end, 3), recovered, `${minutes} min, closed`)
  }
})

// Runs the real worker once a minute against an in-memory store, with every monitor up except
// `site`, which follows `errors` (null for up). After each run the page reads what was stored and
// must show `site` down exactly when the worker has sent its down alert.
async function runWorker(errors) {
  const t0 = 1_800_000_000
  let stored = null
  const sent = []
  let minute = 0
  stubs['cloudflare:workers'] = { DurableObject: class {} }
  stubs['p-limit'] = { default: () => (fn) => fn() }
  stubs['./store'] = {
    CompactedMonitorStateWrapper,
    getFromStore: async () => stored,
    setToStore: async (_env, _key, value) => void (stored = value),
  }
  stubs['./util'] = {
    getWorkerLocation: async () => 'DEN',
    formatAndNotify: async (monitor, isUp) => void sent.push({ id: monitor.id, isUp, minute }),
  }
  stubs['./monitor'] = {
    doMonitor: async (monitor) => {
      const err = monitor.id === 'site' ? errors[minute] : null
      return { id: monitor.id, location: 'DEN', status: { up: err === null, ping: err === null ? 400 : 10000, err: err ?? '' } }
    },
  }
  const { default: Worker } = load('@/worker/src/index')
  const realNow = Date.now
  const realLog = console.log
  console.log = () => {}
  try {
    let alerted = false
    for (minute = 0; minute < errors.length; minute++) {
      const t = t0 + minute * 60
      Date.now = () => t * 1000
      await Worker.scheduled({}, {}, {})
      if (errors[minute] === null) alerted = false
      if (sent.some((a) => a.id === 'site' && !a.isUp && a.minute === minute)) alerted = true
      const state = new CompactedMonitorStateWrapper(stored).uncompact()
      const site = buildModel(state, [{ id: 'site', name: 'Site' }], [], grace, t * 1000).monitors[0]
      assert.equal(site.status === 'down', alerted, `minute ${minute}: page ${site.status}, down alert sent ${alerted}`)
    }
  } finally {
    Date.now = realNow
    console.log = realLog
    for (const k of ['cloudflare:workers', 'p-limit', './store', './util', './monitor']) delete stubs[k]
    delete cache[join(root, 'worker/src/index.ts')]
  }
  return sent.filter((a) => a.id === 'site').map((a) => `${a.isUp ? 'up' : 'down'}@${a.minute}`)
}

test('the stored page agrees with the worker\'s down alert through the write cooldown', async () => {
  const T = 'Timeout after 10000ms'
  assert.deepEqual(await runWorker([null, 'HTTP 502', T, T, T, T, null]), ['down@4', 'up@6'])
  assert.deepEqual(await runWorker([null, 'HTTP 502', 'HTTP 502', T, T, T, null]), ['down@4', 'up@6'])
  assert.deepEqual(await runWorker([null, ...Array(6).fill('HTTP 502'), null]), ['down@4', 'up@7'])
  assert.deepEqual(await runWorker([null, 'HTTP 502', 'HTTP 502', null, null]), [])
})

// The routes read the same stored state the page does
async function route(file, incidents, query = '') {
  const w = new CompactedMonitorStateWrapper(null)
  for (const m of workerConfig.monitors) {
    for (const inc of [marker, ...(m.id === 'site' ? incidents : [])]) w.appendIncident(m.id, inc)
    w.appendLatency(m.id, { loc: 'DEN', ping: m.id === 'site' && incidents.at(-1)?.end === null ? 10000 : 400, time: now })
  }
  w.data.lastUpdate = now
  const str = w.getCompactedStateStr()
  stubs['@/worker/src/store'] = { CompactedMonitorStateWrapper, getFromStore: async () => str }
  delete cache[join(root, file)]
  const { default: handler } = load('@/' + file)
  return (await handler(new Request('http://status.test/api/x' + query))).json()
}

test('/api/data and /api/badge call a failure down only past the grace period', async () => {
  const inGrace = [failingFor(149)]
  const past = [failingFor(150)]
  let d = await route('pages/api/data.ts', inGrace)
  assert.deepEqual([d.monitors.site.up, d.monitors.site.latency, d.down], [true, null, 0])
  d = await route('pages/api/data.ts', past)
  assert.deepEqual([d.monitors.site.up, d.down, d.up], [false, 1, workerConfig.monitors.length - 1])
  d = await route('pages/api/data.ts', [failedFor(60)])
  assert.deepEqual([d.monitors.site.up, d.monitors.site.latency], [true, 400])
  // A long outage that has ended is up again
  d = await route('pages/api/data.ts', [failedFor(600, 900)])
  assert.deepEqual([d.monitors.site.up, d.down], [true, 0])
  assert.equal((await route('pages/api/badge.ts', [failedFor(600, 900)], '?id=site')).message, 'UP')
  assert.equal((await route('pages/api/badge.ts', inGrace, '?id=site')).message, 'UP')
  assert.equal((await route('pages/api/badge.ts', past, '?id=site')).message, 'DOWN')
})
