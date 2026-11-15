import React, { useEffect, useState } from 'react'
import rules from '../../data/rules.json'
import { careCall } from './api'
import { Logo } from './Side'
import './care.css'

const NAME = Object.fromEntries(rules.signs.map((s) => [s.id, s.name_en]))
const LV = { RED: 'Red', AMBER: 'Amber', UNSURE: 'Unsure', GREEN: 'Green' }
const ago = (t) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(t)) / 60000))
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}
const age = (r) => (r.age_value == null ? '' : `${r.age_value} ${r.age_unit || ''}`)
const Ic = ({ d }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
const ICON = { overview: 'M3 12l9-8 9 8M5 10v10h14V10', inbox: 'M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5', villages: 'M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z', lock: 'M6 11h12v9H6zM8 11V8a4 4 0 118 0v3' }
const Lvl = ({ level }) => <span className={`cx-lv ${level.toLowerCase()}`}>{LV[level]}</span>

// Care-team dashboard at /#care. Prototype access gate, not real security. Patient codes only, never names.
export default function Care() {
  const [access, setAccess] = useState(sessionStorage.getItem('careCode') || '')
  const [input, setInput] = useState('')
  const [view, setView] = useState('overview')
  const [items, setItems] = useState(null)
  const [sum, setSum] = useState(null)
  const [filter, setFilter] = useState('all')
  const [err, setErr] = useState('')
  const [checked, setChecked] = useState(null)

  const call = async (body) => {
    const d = await careCall({ ...body, access })
    setErr(d ? '' : 'Wrong access code, or the server is unreachable.')
    return d
  }
  const load = async () => {
    const [a, b] = await Promise.all([call({ action: 'inbox' }), call({ action: 'summary' })])
    if (a) setItems(a.items)
    if (b) setSum(b)
  }
  useEffect(() => { if (access) load() }, [access])

  if (!access) {
    return (
      <div className="cx-gate">
        <div className="cx-gate-card">
          <div className="cx-gate-logo"><Logo size={36} /><b>Asha Sethu</b><span>Care team</span></div>
          <label>Access code</label>
          <input type="password" value={input} autoFocus onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (sessionStorage.setItem('careCode', input), setAccess(input))} />
          <button onClick={() => { sessionStorage.setItem('careCode', input); setAccess(input) }}>Continue</button>
          <p>Prototype gate, not real security. Real logins come before any field use.</p>
          <a href="#">Back to the app</a>
        </div>
      </div>
    )
  }

  const list = items || []
  const waiting = list.filter((i) => !i.received)
  const shown = list.filter((i) => filter === 'all' || (filter === 'red' && i.level === 'RED') || (filter === 'amber' && i.level === 'AMBER') || (filter === 'open' && !i.received))
  const demo = list.some((i) => i.demo) || (sum && sum.demo)
  const receive = async (code) => { await call({ action: 'receive', code }); load() }
  const run = async (a) => { await call({ action: a }); load() }
  const check = async () => { const d = await call({ action: 'summary' }); if (d) { setSum(d); setChecked(new Date()) } }
  const maxV = Math.max(1, ...(sum ? sum.villages.map((v) => v.visits) : [1]))
  const nav = [['overview', 'Overview', ICON.overview], ['inbox', 'Doctor inbox', ICON.inbox], ['villages', 'Villages', ICON.villages]]

  return (
    <div className="cx">
      <aside className="cx-side">
        <div className="cx-brand"><Logo size={30} /><b>Asha Sethu</b></div>
        <div className="cx-navlab">Care team</div>
        {nav.map(([k, t, d]) => (
          <button key={k} className={`cx-nav ${view === k ? 'on' : ''}`} onClick={() => setView(k)}>
            <Ic d={d} />{t}{k === 'inbox' && waiting.length > 0 && <span className="cx-count">{waiting.length}</span>}
          </button>
        ))}
        <div className="cx-grow" />
        <a className="cx-nav" href="#"><Ic d="M15 18l-6-6 6-6" />Back to the app</a>
        <button className="cx-nav" onClick={() => { sessionStorage.removeItem('careCode'); setAccess('') }}><Ic d={ICON.lock} />Lock</button>
      </aside>

      <main className="cx-main">
        <header className="cx-top">
          <div>
            <h1>{view === 'overview' ? 'Overview' : view === 'inbox' ? 'Doctor inbox' : 'Villages'}</h1>
            <p>{view === 'overview' ? 'What needs attention now' : view === 'inbox' ? 'Referrals sent by health workers. Red first, then newest.' : 'Last 7 days. Counts only, no names.'}</p>
          </div>
          <div className="cx-top-r">
            {demo && <span className="cx-demo">DEMO DATA</span>}
            <button className="cx-btn" onClick={load}>Refresh</button>
          </div>
        </header>
        {err && <div className="cx-err">{err}</div>}

        {view === 'overview' && (
          <>
            <div className="cx-kpis">
              <div className="cx-kpi"><span>Waiting for a doctor</span><b>{waiting.length}</b></div>
              <div className="cx-kpi"><span>Red referrals</span><b>{list.filter((i) => i.level === 'RED').length}</b></div>
              <div className={`cx-kpi ${sum && sum.overdue.length ? 'warn' : ''}`}><span>Overdue follow-ups</span><b>{sum ? sum.overdue.length : 0}</b></div>
              <div className={`cx-kpi ${sum && sum.alerts.length ? 'warn' : ''}`}><span>Village alerts</span><b>{sum ? sum.alerts.length : 0}</b></div>
            </div>
            <div className="cx-cols">
              <section className="cx-card">
                <div className="cx-card-h"><h2>Needs a doctor</h2><button className="cx-link" onClick={() => setView('inbox')}>Open inbox</button></div>
                {waiting.slice(0, 5).map((r) => (
                  <div key={r.code + r.sent_at} className="cx-line"><Lvl level={r.level} /><span><b>{r.patient_type === 'mother' ? 'Mother' : 'Newborn'}</b> · {r.code}</span><em>{r.village || '-'}</em><i>{ago(r.sent_at)}</i></div>
                ))}
                {waiting.length === 0 && <div className="cx-empty">Nothing waiting.</div>}
              </section>
              <section className="cx-card">
                <div className="cx-card-h"><h2>Alerts</h2></div>
                {sum && sum.alerts.map((a) => <div key={a.village + a.sign} className="cx-alert"><b>{a.count} cases</b> of "{NAME[a.sign] || a.sign}" in {a.village} in 7 days</div>)}
                {sum && sum.overdue.map((o) => <div key={o.code} className="cx-alert red"><b>{o.code}</b> {LV[o.level]} referral not confirmed reached, {o.hours_overdue} h overdue ({o.village})</div>)}
                {sum && !sum.alerts.length && !sum.overdue.length && <div className="cx-empty">No alerts.</div>}
              </section>
            </div>
          </>
        )}

        {view === 'inbox' && (
          <section className="cx-card flush">
            <div className="cx-tabs">
              {[['all', 'All'], ['open', 'Not received'], ['red', 'Red'], ['amber', 'Amber']].map(([k, t]) => <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{t}</button>)}
            </div>
            <table className="cx-table">
              <thead><tr><th>Level</th><th>Patient</th><th>Signs</th><th>Village</th><th>Sent</th><th /></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.code + r.sent_at}>
                    <td><Lvl level={r.level} /></td>
                    <td><b>{r.patient_type === 'mother' ? 'Mother' : 'Newborn'}</b><small>{r.code}{age(r) && ` · ${age(r)}`}</small></td>
                    <td className="sg">{r.signs.map((x) => NAME[x] || x).join(', ') || '-'}</td>
                    <td>{r.village || '-'}</td>
                    <td>{ago(r.sent_at)}</td>
                    <td className="act">{r.received ? <span className="cx-ok">Received</span> : <button className="cx-btn pri" onClick={() => receive(r.code)}>Mark received</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && <div className="cx-empty pad">No referrals here yet. Use Load demo data below to preview.</div>}
          </section>
        )}

        {view === 'villages' && sum && (
          <>
            <section className="cx-card">
              <div className="cx-card-h"><h2>Weekly counts by village</h2><button className="cx-btn pri" onClick={check}>Run check now</button></div>
              {checked && <div className="cx-checked">Checked at {checked.toLocaleTimeString()}: {sum.overdue.length} overdue referral{sum.overdue.length === 1 ? '' : 's'}, {sum.alerts.length} village alert{sum.alerts.length === 1 ? '' : 's'}.</div>}
              <table className="cx-table">
                <thead><tr><th>Village</th><th>Visits</th><th /><th>Red</th><th>Not confirmed reached</th></tr></thead>
                <tbody>
                  {sum.villages.map((v) => (
                    <tr key={v.village} className={sum.alerts.some((a) => a.village === v.village) ? 'hot' : ''}>
                      <td><b>{v.village}</b></td><td>{v.visits}</td>
                      <td className="bar"><div><i style={{ width: `${(v.visits / maxV) * 100}%` }} /></div></td>
                      <td>{v.red}</td><td>{v.unreached}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sum.villages.length === 0 && <div className="cx-empty pad">No visits in the last 7 days.</div>}
            </section>
            {sum.alerts.map((a) => <div key={a.village + a.sign} className="cx-alert"><b>Alert:</b> {a.count} cases of "{NAME[a.sign] || a.sign}" in {a.village} in 7 days</div>)}
            {sum.overdue.length > 0 && (
              <section className="cx-card">
                <div className="cx-card-h"><h2>Overdue referrals</h2></div>
                {sum.overdue.map((o) => <div key={o.code} className="cx-line"><Lvl level={o.level} /><span><b>{o.code}</b></span><em>{o.village}</em><i>{o.hours_overdue} h overdue</i></div>)}
              </section>
            )}
          </>
        )}

        <footer className="cx-foot">
          <button className="cx-btn" onClick={() => run('seed_demo')}>Load demo data</button>
          <button className="cx-btn" onClick={() => run('clear_demo')}>Clear demo data</button>
          <span>Demo rows are made up and tagged DEMO DATA.</span>
        </footer>
      </main>
    </div>
  )
}
