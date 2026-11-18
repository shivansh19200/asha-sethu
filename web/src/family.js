// A1 family records. The family (or the ASHA) keeps a plain file; nothing is uploaded.
// One versioned format, so the same record can move to server accounts (A2) without rework.
// File = { format, schema_version, exported_at, rules_version, consent (stub), records[], checksum }.
// No names go into the file. Only a patient code, signs, level, age in days, advice and dates.
import rules from '../../data/rules.json'
import questions from '../../data/questions.json'
import { currentLevel, RANK } from './floor'

export const FORMAT = 'asha-sethu-record'
export const SCHEMA = 1
const KEY = 'famRecords'
const MAX_LOCAL = 200
export const MAX_FILE_BYTES = 1024 * 1024
export const MAX_RECORDS = 500

const SIGN = Object.fromEntries(rules.signs.map((s) => [s.id, s]))
const QMAP = Object.fromEntries(questions.questions.map((q) => [q.id, q]))
const LEVELS = ['RED', 'AMBER', 'UNSURE', 'GREEN']

// ---- local store (on this phone only) ----
const read = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] } }
const write = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, MAX_LOCAL))) } catch { /* storage full or blocked */ } }
export const getFam = () => read().slice().sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
export const addFam = (rec) => write([rec, ...read().filter((x) => x.record_id !== rec.record_id)])
export const delFam = (id) => write(read().filter((x) => x.record_id !== id))

// ---- build a record from a saved visit ----
export function makeRecord({ id, code, patient, signs, answers, level, ageDays, advised, demo }) {
  return {
    record_id: id,
    child_ref: code || null,
    patient: patient === 'mother' ? 'mother' : 'newborn',
    created_at: new Date().toISOString(),
    level,
    signs: [...new Set(signs.filter((s) => SIGN[s]))],
    answers: answers.filter((a) => QMAP[a.qid]).map((a) => ({ qid: a.qid, answer: a.answer })),
    age_days: Math.max(0, Math.min(55000, Math.round(ageDays || 0))),
    advised: String(advised || '').slice(0, 300),
    rules_version: rules.version,
    demo: !!demo
  }
}

// ---- level check on records we did not make ourselves ----
// The level shown is never lower than what the current rules give for the same signs.
export function floorOf(rec) {
  const answers = rec.answers.map((a) => ({ qid: a.qid, sign: QMAP[a.qid].sign, answer: a.answer, levelIfYes: QMAP[a.qid].level_if_yes }))
  return currentLevel({ signs: rec.signs, answers, unclear: false, skipped: false, checklistDone: true })
}
export function shownLevel(rec) {
  const f = floorOf(rec)
  return RANK[f] > RANK[rec.level] ? { level: f, raised: true } : { level: rec.level, raised: false }
}

// ---- validation: strict, returns { ok:true, records } or { ok:false, err, detail } ----
const isId = (s) => typeof s === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(s)
const isDate = (s) => typeof s === 'string' && s.length <= 40 && !Number.isNaN(Date.parse(s)) && Date.parse(s) > Date.parse('2020-01-01') && Date.parse(s) < Date.now() + 864e5

function checkRecord(r) {
  if (!r || typeof r !== 'object') return 'id'
  if (!isId(r.record_id)) return 'id'
  if (r.child_ref !== null && !(typeof r.child_ref === 'string' && /^[A-Z0-9]{1,8}$/.test(r.child_ref))) return 'id'
  if (r.patient !== 'mother' && r.patient !== 'newborn') return 'patient'
  if (!isDate(r.created_at)) return 'date'
  if (!LEVELS.includes(r.level)) return 'level'
  if (!Array.isArray(r.signs) || r.signs.length > 40) return 'sign'
  const pre = r.patient === 'mother' ? 'm_' : 'nb_'
  if (!r.signs.every((s) => typeof s === 'string' && SIGN[s] && s.startsWith(pre))) return 'sign'
  if (!Array.isArray(r.answers) || r.answers.length > 60) return 'answer'
  if (!r.answers.every((a) => a && QMAP[a.qid] && QMAP[a.qid].sign.startsWith(pre) && ['yes', 'no', 'unsure'].includes(a.answer))) return 'answer'
  if (!Number.isInteger(r.age_days) || r.age_days < 0 || r.age_days > 55000) return 'age'
  if (typeof r.advised !== 'string' || r.advised.length > 300) return 'text'
  if (typeof r.rules_version !== 'string' || r.rules_version.length > 16) return 'text'
  if (typeof r.demo !== 'boolean') return 'text'
  return null
}

async function sha256(text) {
  try {
    if (!(window.crypto && window.crypto.subtle)) return null
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch { return null }
}

export async function buildFile(records) {
  const recs = records.map(({ imported, ...r }) => r) // local-only flag stays out of the file
  return {
    format: FORMAT,
    schema_version: SCHEMA,
    exported_at: new Date().toISOString(),
    rules_version: rules.version,
    // Consent stub: nothing is collected in A1. A2 fills this in (notice shown, when, which version, by whom).
    consent: { stub: true, notice_version: null, shown_at: null, given: null },
    records: recs,
    checksum: await sha256(JSON.stringify(recs))
  }
}

export async function parseFile(text) {
  if (typeof text !== 'string' || text.length > MAX_FILE_BYTES) return { ok: false, err: 'tooBig' }
  let f
  try { f = JSON.parse(text) } catch { return { ok: false, err: 'notJson' } }
  if (!f || typeof f !== 'object' || f.format !== FORMAT) return { ok: false, err: 'wrongFormat' }
  if (!Number.isInteger(f.schema_version) || f.schema_version < 1) return { ok: false, err: 'wrongFormat' }
  if (f.schema_version > SCHEMA) return { ok: false, err: 'newer' }
  if (!Array.isArray(f.records) || f.records.length === 0) return { ok: false, err: 'empty' }
  if (f.records.length > MAX_RECORDS) return { ok: false, err: 'tooMany' }
  for (let i = 0; i < f.records.length; i++) {
    const why = checkRecord(f.records[i])
    if (why) return { ok: false, err: 'badRecord', index: i, why }
  }
  if (f.checksum) {
    const now = await sha256(JSON.stringify(f.records))
    if (now && now !== f.checksum) return { ok: false, err: 'checksum' }
  }
  const clean = f.records.map((r) => ({
    record_id: r.record_id, child_ref: r.child_ref, patient: r.patient, created_at: r.created_at, level: r.level,
    signs: [...new Set(r.signs)], answers: r.answers.map((a) => ({ qid: a.qid, answer: a.answer })),
    age_days: r.age_days, advised: r.advised, rules_version: r.rules_version, demo: r.demo
  }))
  return { ok: true, records: clean }
}

// Adds new records, skips ones already here (same record_id). Returns counts.
export function mergeRecords(records) {
  const have = new Set(read().map((x) => x.record_id))
  const fresh = records.filter((r) => !have.has(r.record_id)).map((r) => ({ ...r, imported: true }))
  write([...fresh, ...read()])
  return { added: fresh.length, skipped: records.length - fresh.length }
}

// ---- save the file on the phone (or share it where the browser supports files) ----
export async function saveFile(name, obj) {
  const text = JSON.stringify(obj, null, 2)
  const file = typeof File === 'function' ? new File([text], name, { type: 'application/json' }) : null
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'shared' }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled' }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}

export const fileName = (rec) => `asha-sethu-${rec && rec.child_ref ? rec.child_ref.toLowerCase() : 'records'}-${new Date().toISOString().slice(0, 10)}.json`
