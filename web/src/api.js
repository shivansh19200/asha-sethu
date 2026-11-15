import { currentLevel, nextQuestion } from './floor'
//import { headers } from 'next/headers';

const VKEY = 'pendingVisits'
const SKEY = 'pendingSends'
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }
const write = (k, a) => localStorage.setItem(k, JSON.stringify(a))

async function postJson(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error('http ' + r.status)
  return r.json()
}

// Saves to the server; on failure keeps a copy on the phone and retries later.
export async function saveVisit(body) {
  try { const d = await postJson('/api/visits', body); return { ok: true, code: d.patient_code } }
  catch { write(VKEY, [...read(VKEY), body]); return { ok: false, code: null } }
}

// Only called after the worker taps "Send referral".
export async function sendReferral(clientId) {
  try { await postJson('/api/referral', { client_id: clientId }); return { ok: true } }
  catch { const q = read(SKEY); if (!q.includes(clientId)) write(SKEY, [...q, clientId]); return { ok: false } }
}

// Visits first, then queued referrals. Each item is removed from the phone once it has synced.
export async function syncPending() {
  const left = []
  for (const b of read(VKEY)) { try { await postJson('/api/visits', b) } catch { left.push(b) } }
  write(VKEY, left)
  const sends = []
  for (const id of read(SKEY)) { try { await postJson('/api/referral', { client_id: id }) } catch { sends.push(id) } }
  write(SKEY, sends)
}

// write_note() + fill_record() on the server. Returns null if the server is down.
export async function getNote(payload) {
  try { return await postJson('/api/note', payload) } catch { return null }
}

// Asks the agent for the next step. If the server is down, falls back to the local floor logic so the demo never breaks.
export async function callAgent(visit, showNow) {
  const prev = visit.agent || {}
  const body = {
    patient: visit.patient === 'mother' ? 'mother' : 'newborn',
    signs: visit.signs,
    answers: visit.answers.map((a) => ({ qid: a.qid, answer: a.answer })),
    unclear: visit.unclear,
    checklist_done: visit.checklistDone,
    show_now: showNow,
    suggestion: prev.suggestion || null,
    trace: prev.trace || []
  }
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 9000)
    const r = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal })
    clearTimeout(timer)
    if (!r.ok) throw new Error('bad')
    return await r.json()
  } catch {
    const v = { ...visit, skipped: showNow && !!nextQuestion(visit) }
    const q = showNow ? null : nextQuestion(v)
    return { status: q ? 'ask' : 'done', engine: 'local', question: q, level: currentLevel(v), trace: null, suggestion: null }
  }
}