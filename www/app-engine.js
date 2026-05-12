// app-engine.js - SMART TURBO (No Errors, Just Speed)
(function() {
    const config = {
        apiKey: "AIzaSyDt_ayoflnFkRRnS2fXITY2EzJz0KcW5QA",
        authDomain: "makert-bfb76.firebaseapp.com",
        databaseURL: "https://makert-bfb76-default-rtdb.firebaseio.com",
        projectId: "makert-bfb76",
        storageBucket: "makert-bfb76.firebasestorage.app",
        appId: "1:245693362931:web:e15662a22dd50d2ac63d86"
    };

    // 1. CHITETEZO (Safety Check): Ngati Firebase isanafike, yambitsani
    if (typeof firebase !== 'undefined') {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(config);
        }
        
        // 2. TSEGULANI SPEED (Persistence & Global Sync)
        // Izi zikuuza foni kuti: "Sungani deta iliyonse m'foni muno"
        if (firebase.firestore) {
            firebase.firestore().enablePersistence({synchronizeTabs: true}).catch(() => {
                // Ngati Persistence yafika kale, osapereka error
            });
        }

        if (firebase.database) {
            // Izi zipangitsa kuti RTDB idziwe database yonse mwakachetechete
            firebase.database().ref("/").keepSynced(true);
        }
    }

    // 3. SERVICE WORKER (Background Ghost)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                // Tumizani config ku sw.js kuti igwire ntchito kuseri
                if (reg.active) {
                    reg.active.postMessage({ type: 'BOOT_TURBO', config: config });
                }
            });
        });
    }
})();