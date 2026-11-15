//import { headers } from 'next/headers';
import { currentLevel, nextQuestion } from './floor'
const KEY = 'pendingVisits'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (a) => localStorage.setItem(KEY, JSON.stringify(a))

async function post(body) {
  const r = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error('http ' + r.status)
  return r.json()
}

// Saves to the server; on failure keeps a copy on the phone and retries later.
export async function saveVisit(body) {
  try { const d = await post(body); return { ok: true, code: d.patient_code } }
  catch { write([...read(), body]); return { ok: false, code: null } }
}

export async function syncPending() {
  const left = []
  for (const b of read()) { try { await post(b) } catch { left.push(b) } }
  write(left)
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