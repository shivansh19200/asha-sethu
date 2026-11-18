import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Landing from './Landing'
import Busy from './Busy'
import Tour from './Tour'
import './layout.css'
import './polish.css'

// Desktop: scrolling landing page with the real app embedded in a phone frame.
// Phone, or #care: just the app (the care page is full width).
const care = window.location.hash === '#care'
const desktop = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches
try { document.documentElement.lang = localStorage.getItem('language') === 'हि' ? 'hi' : 'en' } catch { /* ignore */ }
document.body.classList.toggle('care-mode', care)
document.body.classList.toggle('landing-mode', desktop && !care)
try { document.body.classList.toggle('demo-on', !!localStorage.getItem('demoMode')) } catch { /* ignore */ }
window.addEventListener('hashchange', () => window.location.reload())

createRoot(document.getElementById('root')).render(desktop && !care ? <Landing><App /></Landing> : <><App />{!care && <Tour />}</>)

const busy = document.createElement('div')
document.body.appendChild(busy)
createRoot(busy).render(<Busy />)

// Offline: after the first visit the app opens with no signal. Only on the live build.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready).then((reg) => {
      const urls = performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.startsWith(window.location.origin) && !u.includes('/api/') && !u.includes('/audio/'))
      if (reg.active) reg.active.postMessage({ type: 'cache', urls })
    }).catch(() => { /* no offline mode; the app still works online */ })
  })
}
