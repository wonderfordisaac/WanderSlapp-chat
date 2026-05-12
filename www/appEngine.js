// app-engine.js - UNIVERSAL 0-SECOND RELOADER
(function() {
    // 1. DZINA LA TSAMBA: Izi zikuthandiza kuti isasokoneze deta ya ma file ena
    const pageID = "ws_cache_" + window.location.pathname.split("/").pop();

    // 2. KUTULUTSA DETA (0 SECONDS)
    // User akangotsegula, tikuonetsa zomwe anasiya paja nthawi yomweyo
    const savedSnapshot = localStorage.getItem(pageID);
    const savedScroll = localStorage.getItem(pageID + "_scroll");

    if (savedSnapshot) {
        // Ikani deta yonse mu body
        document.body.innerHTML = savedSnapshot;
        
        // Bweretsani user pamene anasiya (Scroll Position)
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll));
        }
        console.log("Turbo: Showing previous snapshot");
    }

    // 3. KUSUNGA DETA (PAMENE USER AKUCHOKA)
    // Nthawi iliyonse user akadina link kapena kutseka App
    window.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            saveCurrentState();
        }
    });

    // Kusunganso deta user akakhala kuti wayamba kupita patsamba lina
    window.addEventListener('pagehide', saveCurrentState);

    function saveCurrentState() {
        // Osasunga ma Overlay kapena ma Popup (ngati alipo)
        // Tikusunga HTML yonse yomwe user akuona pano
        localStorage.setItem(pageID, document.body.innerHTML);
        localStorage.setItem(pageID + "_scroll", window.scrollY);
    }

    // 4. FIREBASE AUTO-REFRESH (PERSISTENCE)
    // Izi zikuthandiza kuti Firebase ikadzuka, izisintha yokha deta popanda user kudikira
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        firebase.database().ref("/").keepSynced(true);
    }
})();

