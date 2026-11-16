import assert from 'node:assert/strict'
import { test } from 'node:test'

import { downAlertDue, upAlertDue } from './alerts.ts'

// Replays one check a minute through the worker's incident rules, with my config: a 3-minute
// grace period and no alerts for a change of error text. Each entry is an error, or null for up.
function alerts(checks, grace = 3, skipErrorChange = true) {
  const sent = []
  let incident = null
  checks.forEach((err, minute) => {
    const now = 1_800_000_000 + minute * 60
    if (err === null) {
      if (incident && upAlertDue(incident, now, grace ?? undefined)) sent.push(`up@${minute}`)
      incident = null
      return
    }
    let changed = false
    if (!incident) {
      incident = { start: [now], error: [err] }
      changed = true
    } else if (incident.error.at(-1) !== err) {
      incident.start.push(now)
      incident.error.push(err)
      changed = true
    }
    if (downAlertDue(incident, now, changed, grace ?? undefined, skipErrorChange))
      sent.push(`down@${minute}`)
  })
  return sent
}

const down = (n, err = 'HTTP 502') => Array(n).fill(err)

test('an outage past 3 minutes sends one down alert at 3 minutes and one recovery', () => {
  assert.deepEqual(alerts([null, ...down(6), null]), ['down@4', 'up@7'])
})

test('a failure that clears within 3 minutes sends nothing', () => {
  assert.deepEqual(alerts([null, ...down(1), null]), [])
  assert.deepEqual(alerts([null, ...down(3), null]), [])
})

test('a change of error text while down sends nothing more', () => {
  assert.deepEqual(alerts([null, ...down(4), ...down(3, 'Timeout after 10000ms'), null]), [
    'down@4',
    'up@8',
  ])
})

test('a change of error text inside the grace period still lets the down alert through', () => {
  assert.deepEqual(alerts([null, ...down(2), ...down(4, 'Timeout after 10000ms'), null]), [
    'down@4',
    'up@7',
  ])
})

test('a change of error text on the 3-minute check still sends the down alert', () => {
  assert.deepEqual(alerts([null, ...down(3), ...down(3, 'Timeout after 10000ms'), null]), [
    'down@4',
    'up@7',
  ])
})

test('with error-change alerts on, a later change of error text alerts again', () => {
  assert.deepEqual(
    alerts([null, ...down(4), ...down(3, 'Timeout after 10000ms'), null], 3, false),
    ['down@4', 'down@5', 'up@8']
  )
})

test('with no grace period every failure alerts at once', () => {
  assert.deepEqual(alerts([null, ...down(1), null], null), ['down@1', 'up@2'])
})

test('the down alert is due from 150 s and the recovery from 210 s, with drift slack', () => {
  const at = (s) => ({ start: [1000 - s] })
  assert.equal(downAlertDue(at(149), 1000, false, 3, true), false)
  assert.equal(downAlertDue(at(150), 1000, false, 3, true), true)
  // Past the window with nothing changed, the down alert has already gone out
  assert.equal(downAlertDue(at(209), 1000, false, 3, true), true)
  assert.equal(downAlertDue(at(210), 1000, false, 3, true), false)
  assert.equal(upAlertDue(at(209), 1000, 3), false)
  assert.equal(upAlertDue(at(210), 1000, 3), true)
})
