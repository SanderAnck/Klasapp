// Verhoog VERSIE bij elke nieuwe versie van de app (en APP_VERSIE in index.html en version.json).
const VERSIE = 'klashouding-v3';
const BESTANDEN = ['./', './index.html', './manifest.json', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSIE)
      .then(c => c.addAll(BESTANDEN.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSIE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Netwerk eerst (zonder browsercache, zodat updates meteen binnenkomen), cache als offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const eigen = url.origin === self.location.origin;
  const netwerk = eigen ? fetch(url.href, { cache: 'no-store', credentials: 'same-origin' }) : fetch(req);
  e.respondWith(
    netwerk
      .then(res => {
        if (res && (res.ok || res.type === 'opaque') && !url.pathname.endsWith('version.json')) {
          const kopie = res.clone();
          caches.open(VERSIE).then(c => c.put(req, kopie)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
