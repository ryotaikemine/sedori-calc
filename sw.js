const CACHE_VERSION = 'v3';
const CACHE_NAME = 'sedori-calc-' + CACHE_VERSION;
const urlsToCache = [
  './',
  './index.html',
  './manifest.webmanifest',
  './shushi-kanri/',
  './shushi-kanri/index.html',
  './shushi-kanri/manifest.json'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c){
      return Promise.all(urlsToCache.map(function(u){
        return c.add(u).catch(function(){ return null; });
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_NAME) return caches.delete(k);
        return null;
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.status === 200){
        const copy = res.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(hit){
        if(hit) return hit;
        return caches.match('./shushi-kanri/index.html');
      });
    })
  );
});
