// sw.js - SMART BACKGROUND SYNC (Firestore + RTDB)
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-database-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore-compat.js');

// 1. LANDIRA CONFIG KUCHOKERA KU APP-ENGINE.JS
self.addEventListener('message', (event) => {
    if (event.data.type === 'BOOT_TURBO') {
        const config = event.data.config;

        // Ngati Firebase isanatsegulidwe mu Service Worker, itseguleni
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }

        // 2. RTDB TURBO: Sungani database yonse m'foni nthawi zonse
        // Izi zikuthandiza kuti ma file 200 onse azitenga deta mu 0 seconds
        const rtdb = firebase.database();
        rtdb.ref("/").keepSynced(true);

        // 3. FIRESTORE TURBO: Sungani deta yambiri m'foni (Unlimited Cache)
        const db = firebase.firestore();
        db.settings({ 
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED 
        });

        console.log("🛡️ Wander-Engine (sw.js) is now Syncing Global Data...");
    }
});

// 4. OFFLINE CACHING: Izi zimathandiza kuti ma file a HTML azitsegula mwachangu
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Izi zimapangitsa Service Worker kukhala 'Active' nthawi yomweyo
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});