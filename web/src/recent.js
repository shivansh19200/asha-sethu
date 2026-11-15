// Recent visits live on the phone (patient code, level, time only: no names). Follow-up rule: RED 1 day, AMBER 2 days.
const KEY = 'recentVisits'
const DAY = 86400000
export const DUE_DAYS = { RED: 1, AMBER: 2 }
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (a) => localStorage.setItem(KEY, JSON.stringify(a.slice(0, 50)))

export const addRecent = (v) => write([v, ...read().filter((x) => x.id !== v.id)])
export const getRecent = () => read()
export const patchRecent = (id, changes) => write(read().map((x) => (x.id === id ? { ...x, ...changes } : x)))
export const dueAt = (v) => v.ts + DUE_DAYS[v.level] * DAY

export function followups() {
  const now = Date.now()
  const open = read().filter((v) => DUE_DAYS[v.level] && !v.reached)
  return { open, overdue: open.filter((v) => now > dueAt(v)) }
}

export function ago(ts, lang) {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000))
  if (m < 60) return lang === 'hi' ? `${m} मिनट पहले` : `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return lang === 'hi' ? `${h} घंटे पहले` : `${h} h ago`
  const d = Math.round(h / 24)
  return lang === 'hi' ? `${d} दिन पहले` : `${d} d ago`
}
