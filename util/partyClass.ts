export const PARTY_CLASSES = ['Paladin', 'Cleric', 'Mage', 'Rogue', 'Bard'] as const
export type PartyClass = (typeof PARTY_CLASSES)[number]

const BY_ID: Record<string, PartyClass> = {
  site: 'Paladin',
  docs_quick_start: 'Cleric',
  docs_installation: 'Mage',
  api_reference: 'Rogue',
  radio: 'Bard',
}

// FNV-1a, so an id with no fixed class still gets the same one on every load
function hash(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return h >>> 0
}

export function classFor(id: string): PartyClass {
  return BY_ID[id] ?? PARTY_CLASSES[hash(id) % PARTY_CLASSES.length]
}

if (process.env.NODE_ENV !== 'production') {
  console.assert(classFor('site') === 'Paladin' && classFor('radio') === 'Bard', 'fixed ids keep their class')
  console.assert(classFor('some_new_monitor') === classFor('some_new_monitor'), 'the fallback is deterministic')
  console.assert(PARTY_CLASSES.includes(classFor('some_new_monitor')), 'the fallback is a known class')
}
