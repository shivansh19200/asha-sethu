import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Landing from './Landing'
import Busy from './Busy'
import './layout.css'
import './polish.css'

// Desktop: scrolling landing page with the real app embedded in a phone frame.
// Phone, or #care: just the app (the care page is full width).
const care = window.location.hash === '#care'
const desktop = window.matchMedia('(min-width: 900px)').matches
document.body.classList.toggle('care-mode', care)
document.body.classList.toggle('landing-mode', desktop && !care)
window.addEventListener('hashchange', () => window.location.reload())

createRoot(document.getElementById('root')).render(desktop && !care ? <Landing><App /></Landing> : <App />)

const busy = document.createElement('div')
document.body.appendChild(busy)
createRoot(busy).render(<Busy />)
