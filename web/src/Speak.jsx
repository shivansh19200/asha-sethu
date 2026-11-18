import React, { useEffect, useRef, useState } from 'react'
import { Icon } from './ui'
import { Y } from './i18n2'

// Reads one fixed piece of text aloud. Nothing is generated.
// 1) A recorded clip, if /audio/manifest.json lists it for this language (best: same voice on every phone).
// 2) Otherwise the phone's own voice reads the exact same text, if the phone has a voice for the language.
// 3) Otherwise no button is shown (a button that stays silent would be worse than none).
let manifest = null
const loadManifest = () => manifest || (manifest = fetch('/audio/manifest.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})))
const synth = () => { try { return 'speechSynthesis' in window ? window.speechSynthesis : null } catch { return null } }
const hasVoice = (lang) => { const s = synth(); try { return !!s && s.getVoices().some((v) => v.lang.toLowerCase().startsWith(lang)) } catch { return false } }

export default function Speak({ id, text, lang }) {
  const y = Y[lang]
  const [clip, setClip] = useState(false)
  const [voice, setVoice] = useState(() => hasVoice(lang))
  const [on, setOn] = useState(false)
  const audio = useRef(null)

  useEffect(() => {
    let live = true
    loadManifest().then((m) => { if (live) setClip(Array.isArray(m && m[lang]) && m[lang].includes(id)) })
    return () => { live = false }
  }, [id, lang])

  useEffect(() => {
    const s = synth()
    const f = () => setVoice(hasVoice(lang))
    f()
    if (s && s.addEventListener) s.addEventListener('voiceschanged', f)
    return () => { if (s && s.removeEventListener) s.removeEventListener('voiceschanged', f) }
  }, [lang])

  const stop = () => {
    if (audio.current) { audio.current.pause(); audio.current = null }
    const s = synth(); if (s) s.cancel()
    setOn(false)
  }
  useEffect(() => () => { if (audio.current) audio.current.pause(); const s = synth(); if (s) s.cancel() }, [])

  const speakText = () => {
    const s = synth()
    if (!s || !voice) { setOn(false); return }
    s.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    u.rate = 0.9
    u.onend = () => setOn(false)
    u.onerror = () => setOn(false)
    s.speak(u)
  }
  const play = () => {
    if (on) { stop(); return }
    setOn(true)
    if (clip) {
      const a = new Audio(`/audio/${lang}/${id}.mp3`)
      audio.current = a
      a.onended = () => setOn(false)
      const p = a.play()
      if (p && p.catch) p.catch(() => { audio.current = null; speakText() })
    } else speakText()
  }

  if (!clip && !voice) return null
  return (
    <button type="button" className="spk" onClick={play} aria-pressed={on}>
      <Icon name="speaker" size={20} />{on ? y.spkStop : y.spk}
    </button>
  )
}
