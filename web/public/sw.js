// Asha Sethu service worker: lets the app open with no signal after the first visit.
// It never caches or answers /api calls. The app already saves visits on the phone and sends them when signal returns.
const V = 'asha-sethu-v1'
// Module scripts send an Origin header, so a saved copy would not match on "Vary: Origin" without this.
const MATCH = { ignoreVary: true }
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/logo.png', '/logo-192.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('asha-sethu-') && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

// The page tells us which files it loaded, so the first visit is fully available offline afterwards.
self.addEventListener('message', (e) => {
  const d = e.data
  if (!d || d.type !== 'cache' || !Array.isArray(d.urls)) return
  e.waitUntil(caches.open(V).then((c) => Promise.all(d.urls.map((u) => {
    const url = new URL(u, self.location.origin)
    if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return null
    return c.add(url.pathname + url.search).catch(() => null)
  }))))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return          // fonts and other sites: browser handles it
  if (url.pathname.startsWith('/api/')) return             // never cached
  if (req.headers.has('range')) return                     // audio and video ranges go to the network

  if (req.mode === 'navigate') {
    // newest page when online, the saved page when not
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(V).then((c) => c.put('/', copy)) } return r }).catch(() => caches.match('/', MATCH)))
    return
  }
  if (url.pathname.startsWith('/assets/')) {
    // file names carry a hash, so a saved copy is always the right one
    e.respondWith(caches.match(req, MATCH).then((hit) => hit || fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(V).then((c) => c.put(req, copy)) } return r })))
    return
  }
  // everything else on this site: saved copy now, refresh in the background
  e.respondWith(caches.match(req, MATCH).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(V).then((c) => c.put(req, copy)) } return r }).catch(() => hit)
    return hit || net
  }))
})
