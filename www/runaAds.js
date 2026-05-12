/**
 * WanderSlapp Ads Injector - Runner Champion (Exact Design Version)
 * Position: TOP | Cycle: 10s Hide / 5s Show
 */
(function() {
    // 1. Firebase Setup
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyDt_ayoflnFkRRnS2fXITY2EzJz0KcW5QA",
            databaseURL: "https://makert-bfb76-default-rtdb.firebaseio.com",
        });
    }
    const rtdb = firebase.database();

    // 2. CSS Styles - NDASUNGA ZANU ZIJA NDENDENDE (Zomwe zili mu posts ija)
    const style = document.createElement('style');
    style.innerHTML = `
        #game-ads-container {
            position: fixed;
            top: 0; 
            left: 0;
            width: 100%;
            z-index: 9999;
            display: none; /* Imabisidwa poyamba */
            pointer-events: none;
            animation: slideDown 0.4s ease-out;
        }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }

        /* Mawonekedwe ndendende ngati a mu posts feed */
        .market-section { padding: 15px 0; background: #f9f9f9; border-bottom: 8px solid #f0f2f5; position: relative; width: 100%; overflow: hidden; pointer-events: auto; }
        .market-header { display: flex; justify-content: space-between; align-items: center; padding: 0 15px 10px; }
        .market-title { font-weight: bold; font-size: 13px; color: #65676b; text-transform: uppercase; margin: 0; }
        .scroll-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #0a2b4f; color: #fff; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .market-slider { display: flex; overflow-x: auto; gap: 12px; padding: 0 15px; scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .market-slider::-webkit-scrollbar { display: none; }
        .market-item { flex: 0 0 75%; max-width: 280px; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eee; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .price-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.75); color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; z-index: 2; }
        .market-item img { width: 100%; height: 180px; object-fit: contain; background: #f0f2f5; }
        .ad-item-name { padding: 10px 12px 5px; font-size: 14px; font-weight: bold; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .market-btn { border: none; padding: 12px; font-weight: bold; font-size: 13px; text-align: center; text-decoration: none; color: white; display: block; margin-top: auto; }
        .btn-wa { background: #25D366; }
        .btn-web { background: #0a2b4f; }
    `;
    document.head.appendChild(style);

    // Create Container
    const adsContainer = document.createElement('div');
    adsContainer.id = "game-ads-container";
    document.body.appendChild(adsContainer);

    let gameStarted = false;

    // 3. Game State Detector
    const checkGameStatus = setInterval(() => {
        const startScreen = document.getElementById('startScreen');
        // Ngati startScreen yachoka, zikutanthauza kuti player akusewera
        if (startScreen && startScreen.style.display === 'none' && !gameStarted) {
            gameStarted = true;
            startAdsCycle();
        } else if (startScreen && startScreen.style.display !== 'none') {
            gameStarted = false;
            adsContainer.style.display = "none";
        }
    }, 1000);

    function startAdsCycle() {
        // Tikuyembekeza 10s poyamba, kenako timayamba cycle ya 15s (10 hide + 5 show)
        setInterval(() => {
            if (gameStarted) {
                showMarketAds();
            }
        }, 15000);
    }

    async function showMarketAds() {
        const now = Date.now();
        const snapshot = await rtdb.ref("sponsoredAds").once("value");
        const adsData = snapshot.val();

        if (!adsData) return;

        let validAds = [];
        for (let key in adsData) {
            let ad = adsData[key];
            if (ad.expiry && now > ad.expiry) {
                rtdb.ref("sponsoredAds/" + key).remove();
                continue; 
            }
            if (ad.status === "active") {
                validAds.push(ad);
            }
        }

        if (validAds.length === 0) return;
        validAds.sort(() => Math.random() - 0.5);

        let adsHtml = `
            <div class="market-section">
                <div class="market-header">
                    <p class="market-title">Sponsored Market</p>
                    <button class="scroll-btn" onclick="document.getElementById('ad-slider-main').scrollBy({left: 240, behavior: 'smooth'})">
                        ▶
                    </button>
                </div>
                <div class="market-slider" id="ad-slider-main">`;

        validAds.forEach(ad => {
            let btnLabel = "Visit Website";
            let btnClass = "btn-web";
            let btnUrl = ad.link;

            if (ad.btnType === "whatsapp") {
                btnLabel = "WhatsApp";
                btnClass = "btn-wa";
                btnUrl = `https://wa.me/${ad.link.replace(/\+/g, '')}`;
            }

            adsHtml += `
                <div class="market-item">
                    <div class="price-badge">${ad.price || 'Free'}</div>
                    <img src="${ad.img}" onerror="this.src='https://via.placeholder.com/300x200?text=WanderSlapp+Ad'">
                    <div class="ad-item-name">${ad.title}</div>
                    <a href="${btnUrl}" target="_blank" class="market-btn ${btnClass}">${btnLabel}</a>
                </div>`;
        });

        adsHtml += `</div></div>`;
        adsContainer.innerHTML = adsHtml;
        
        // ONETSANI MALONDA
        adsContainer.style.display = "block";

        // BISANI PAKATHA 5 SECONDS
        setTimeout(() => {
            adsContainer.style.display = "none";
        }, 5000);
    }
})();