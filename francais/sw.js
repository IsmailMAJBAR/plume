/* Service worker : garde le guide en cache pour qu'il marche sans connexion.
   Il répond tout de suite depuis le cache, puis met le cache à jour en arrière-plan :
   une nouvelle version publiée apparaît à l'ouverture suivante. */
const CACHE = 'guide-francais-bd583fb915cf';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('guide-francais-') === 0 && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const cle = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(c => c.match(cle, { ignoreSearch: true }).then(enCache => {
    const reseau = fetch(req).then(r => { if (r && r.ok) c.put(cle, r.clone()); return r; }).catch(() => enCache);
    return enCache || reseau;
  })));
});
