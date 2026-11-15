import React, { useState } from 'react'
import rules from '../../data/rules.json'
import { careCall } from './api'
import LevelPill from './Pill'
import './theme.css'
import './result.css'

const NAME = Object.fromEntries(rules.signs.map((s) => [s.id, s.name_en]))
const box = { background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 18, padding: 18 }
const age = (r) => (r.age_value == null ? '' : ` · ${r.age_value} ${r.age_unit || ''}`)
const DemoTag = () => <span className="sx-chip" style={{ fontSize: 11, background: '#FFF4D6', borderColor: '#B7791F' }}>DEMO DATA</span>

// Laptop-width care-team page at /#care. Prototype access gate, not real security. Shows patient codes only, never names.
export default function Care() {
  const [access, setAccess] = useState(sessionStorage.getItem('careCode') || '')
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('inbox')
  const [items, setItems] = useState(null)
  const [sum, setSum] = useState(null)
  const [msg, setMsg] = useState('')

  const call = async (body) => {
    const d = await careCall({ ...body, access })
    if (!d) { setMsg('Wrong access code or server unreachable.'); return null }
    setMsg('')
    return d
  }
  const loadInbox = async () => { const d = await call({ action: 'inbox' }); if (d) setItems(d.items) }
  const loadSum = async () => { const d = await call({ action: 'summary' }); if (d) setSum(d) }
  const refresh = () => { loadInbox(); loadSum() }
  const enter = () => { sessionStorage.setItem('careCode', input); setAccess(input) }
  const receive = async (code) => { await call({ action: 'receive', code }); loadInbox() }
  const seed = async (a) => { await call({ action: a }); refresh() }

  React.useEffect(() => { if (access) refresh() }, [access])

  if (!access) {
    return (
      <div style={{ maxWidth: 420, margin: '80px auto', ...box }}>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>Care team</h1>
        <div className="sx-small">Access code (prototype gate, not real security)</div>
        <input type="password" value={input} onChange={(e) => setInput(e.target.value)} style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid var(--bd)', borderRadius: 10, fontSize: 16 }} />
        <button className="sx-btn" onClick={enter}>Enter</button>
      </div>
    )
  }
  const demo = (items || []).some((i) => i.demo) || (sum && sum.demo)
  return (
    <div style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{tab === 'inbox' ? 'Doctor inbox' : 'Supervisor view'}</h1>
          <div className="sx-small">{tab === 'inbox' ? 'Sorted by urgency, then newest' : 'Last 7 days, counts only. No names.'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {demo && <DemoTag />}
          <button className="sx-btn sm line" onClick={() => setTab('inbox')}>Doctor inbox</button>
          <button className="sx-btn sm line" onClick={() => setTab('sup')}>Supervisor</button>
          <button className="sx-btn sm line" onClick={() => { sessionStorage.removeItem('careCode'); setAccess('') }}>Lock</button>
        </div>
      </div>
      {msg && <div className="sx-small" style={{ color: '#B3261E', marginBottom: 8 }}>{msg}</div>}

      {tab === 'inbox' && (
        <div style={box}>
          {items && items.length === 0 && <div className="sx-small">No referrals yet.</div>}
          {(items || []).map((r) => (
            <div key={r.code + r.sent_at} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--bd)' }}>
              <div style={{ minWidth: 74 }}><LevelPill level={r.level} lang="en" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{r.patient_type === 'mother' ? 'Mother' : 'Newborn'}{age(r)} · code {r.code}</div>
                <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0 }}>{r.signs.map((x) => NAME[x] || x).join(', ') || 'no signs'}</div>
              </div>
              <div className="sx-small" style={{ textTransform: 'none', letterSpacing: 0 }}>{r.village || '-'}<br />{new Date(r.sent_at).toLocaleString()}</div>
              {r.received
                ? <span style={{ fontWeight: 500, color: 'var(--pri)' }}>✓ Received</span>
                : <button className="sx-btn sm line" style={{ borderColor: 'var(--pri)', color: 'var(--pri)' }} onClick={() => receive(r.code)}>Received</button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'sup' && sum && (
        <div style={box}>
          <button className="sx-btn" onClick={loadSum}>Run check now</button>
          <div style={{ margin: '12px 0' }}>
            {sum.overdue.length === 0
              ? <div className="sx-small">Agent check: no overdue referrals.</div>
              : <div style={{ background: '#FDECEA', border: '1px solid #B3261E', borderRadius: 12, padding: 12 }}>
                  <b>Agent check: {sum.overdue.length} overdue referral{sum.overdue.length > 1 ? 's' : ''} not confirmed reached</b>
                  {sum.overdue.map((o) => <div key={o.code} className="sx-small" style={{ textTransform: 'none', letterSpacing: 0 }}>Code {o.code} · {o.level} · {o.village} · {o.hours_overdue} h overdue</div>)}
                </div>}
          </div>
          {sum.alerts.map((a) => (
            <div key={a.village + a.sign} style={{ background: '#FFF4D6', border: '1px solid #B7791F', borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <b>Alert:</b> {a.count} cases of "{NAME[a.sign] || a.sign}" in {a.village} in 7 days
            </div>
          ))}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead><tr style={{ textAlign: 'left' }}><th>Village</th><th>Visits</th><th>Red cases</th><th>Referrals not confirmed reached</th></tr></thead>
            <tbody>
              {sum.villages.map((v) => (
                <tr key={v.village} style={{ borderTop: '1px solid var(--bd)', background: sum.alerts.some((a) => a.village === v.village) ? '#FFF4D6' : 'none' }}>
                  <td style={{ padding: '8px 0' }}>{v.village}</td><td>{v.visits}</td><td>{v.red}</td><td>{v.unreached}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="sx-btn sm line" onClick={() => seed('seed_demo')}>Load demo data</button>
        <button className="sx-btn sm line" onClick={() => seed('clear_demo')}>Clear demo data</button>
      </div>
    </div>
  )
}
