// Which side of the app this phone is used as. Stored on the phone only. No login in this version.
const KEY = 'mode'
export const getMode = () => { try { const m = localStorage.getItem(KEY); return m === 'asha' || m === 'family' ? m : null } catch { return null } }
export const setMode = (m) => { try { if (m) localStorage.setItem(KEY, m); else localStorage.removeItem(KEY) } catch { /* private mode: the choice is asked again next time */ } }
