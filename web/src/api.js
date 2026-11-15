//import { headers } from 'next/headers';
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