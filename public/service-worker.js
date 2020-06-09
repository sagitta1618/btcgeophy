'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'v2';
const OLD_CACHE_NAME = 'v1';

const FILES_TO_CACHE = [ // NOTE : no star import
  './8hIy35hT2dixO91GyeUXks.html',
  './map.html',
  './methods.html',
  './about.html',
  './images/icons/icon128.png',
  './images/icons/icon256.png',
  './images/icons/icon512.png',
  './data/bh_gpr.png',
  './data/bh_gpr2.png',
  './data/bh_mag.png',
  './data/bh_res.png',
  './data/castle-aerial.jpg',
  './data/castle-aerial.png',
  './data/ga_emi.png',
  './data/ga_gpr.png',
  './data/ga_mag.png',
  './data/qm_emi.png',
  './data/qm_gpr.png',
  './data/qm_gpr2.png',
  './data/qm_mag.png',
  './data/qm_res.png',
  './data/vf_emi.png',
  './data/vf_mag.png',
  './data/vf_res.png',
  // './scripts/app.js',
  './scripts/bootstrap.min.js',
  './scripts/geotiff.js',
  './scripts/install.js',
  './scripts/jquery-3.5.1.slim.min.js',
  './scripts/leaflet.css',
  './scripts/leaflet.js',
  './scripts/leaflet-geotiff.js',
  './scripts/plotty.js',
  './scripts/popper.min.js',
  './styles/bootstrap.min.css',
  './styles/inline.css',
  './manifest.webmanifest',
  './offline.html',
  './service-worker.js',
  './images/blank.png',
  './images/btc.jpg',
  './images/btc-logo.png',
  './images/emi.svg',
  './images/favicon.ico',
  './images/gpr.svg',
  './images/location.png',
  './images/location.svg',
  './images/location-retina.png',
  './images/location-shadow.png',
  './images/lu.jpg',
  './images/lu.png',
  './images/lu-logo.png',
  './images/mag.svg',
  './images/marker-icon.png',
  './images/nhlf.png',
  './images/nhlf-logo.png',
  './images/res.svg'
];

// note: 'self' refers to the service Worker

// listen to 'install' event
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching resssources');
      return cache.addAll(FILES_TO_CACHE);
    })
  )
  self.skipWaiting(); // this ensures new service worker is immediately updated on page reload
});

// listen to 'activate' event
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  var cacheKeepList = ['v2'];
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        console.log(cacheKeepList.indexOf(key), 'key=', key)
        if (cacheKeepList.indexOf(key) === -1) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); // this ensures new service worker is immediately updated on page reload
});


// listen to 'fetch' event
self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  if (evt.request.url.includes('mapbox')){
    console.log('mapbox request detected !!!!')
    evt.respondWith(
      fetch(evt.request).then((resp) => {
        console.log('response = ', resp)
        return resp;
      }).catch(() => {
        console.log('offline, loading map tiles failed.')
        return new Response('images/blank.png'); // doesn't work but that's ok
      })
    )
  } else {
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        // if ressource is not found (undefined) then fetch the new resssource
        return response || fetch(evt.request).then((resp) => {
          let respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => {
            console.log('The request ' + evt.request.url + 'was not found in cache so we added it.')
            cache.put(evt.request, respClone);
          });
          return resp;
        });
      }).catch(() => {
        // if not network and not in cache, just return offline page
        console.log('offline and what you want is not in the cache')
        return caches.match('offline.html');
      })
    );
  }
});
