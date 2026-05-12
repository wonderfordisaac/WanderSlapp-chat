/**
 * Post-Market Ads Injector (Standalone Game Top Version)
 * Auto-detects game start and runs 10s hide / 5s show cycle.
 * Positioned at the TOP to avoid blocking game controls.
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

    // 2. CSS Styles - Positioned at the TOP
    const style = document.createElement('style');
    style.innerHTML = `
        #game-ads-container {
            position: fixed;
            top: 0; /* Ikaikidwa mmwamba tsopano */
            left: 0;
            width: 100%;
            z-index: 9999; /* Ikhale pamwamba pa chilichonse */
            display: none;
            pointer-events: none;
            animation: slideDown 0.5s ease;
        }
        @keyframes slideDown { 
            from { transform: translateY(-100%); } 
            to { transform: translateY(0); } 
        }

        .market-section { 
            padding: 8px 0; 
            background: rgba(255,255,255,0.95); 
            border-bottom: 4px solid #ffc107; /* Yellow border monga mu game muja */
            box-shadow: 0 5px 15px rgba(0,0,0,0.4); 
            width: 100%; 
            pointer-events: auto; 
        }
        .market-header { display: flex; justify-content: space-between; align-items: center; padding: 0 15px 3px; }
        .market-title { font-weight: bold; font-size: 10px; color: #333; text-transform: uppercase; margin: 0; }
        .market-slider { display: flex; overflow-x: auto; gap: 8px; padding: 0 15px; scrollbar-width: none; }
        .market-slider::-webkit-scrollbar { display: none; }
        .market-item { flex: 0 0 65%; max-width: 180px; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #ddd; position: relative; display: flex; flex-direction: column; }
        .price-badge { position: absolute; top: 4px; left: 4px; background: #28a745; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; z-index: 5; }
        .market-item img { width: 100%; height: 80px; object-fit: contain; background: #f0f2f5; }
        .ad-item-name { padding: 3px 6px; font-size: 11px; font-weight: bold; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .market-btn { border: none; padding: 6px; font-weight: bold; font-size: 10px; text-align: center; text-decoration: none; color: white; display: block; }
        .btn-wa { background: #25D366; }
        .btn-web { background: #0a2b4f; }
    `;
    document.head.appendChild(style);

    // Create Ads Container
    const adsContainer = document.createElement('div');
    adsContainer.id = "game-ads-container";
    document.body.appendChild(adsContainer);

    let gameStarted = false;

    // 3. AUTO-DETECTOR: Imayang'anira pamene overlay yachoka
    const checkGameStart = setInterval(() => {
        const overlay = document.getElementById('overlay-layer');
        // Ngati overlay yabisika, zikutanthauza kuti game yayamba
        if (overlay && (overlay.style.display === 'none' || overlay.offsetParent === null)) {
            if (!gameStarted) {
                gameStarted = true;
                startAdsCycle();
            }
        }
    }, 1000);

    function startAdsCycle() {
        // Yambani malonda pakatha 10 seconds
        setInterval(() => {
            showAds();
        }, 15000); // 15s cycle: 10s hide + 5s show
    }

    async function showAds() {
        const now = Date.now();
        try {
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
                        <p class="market-title">WanderSlapp Marketplace</p>
                    </div>
                    <div class="market-slider">`;

            validAds.forEach(ad => {
                let btnLabel = "Visit Website";
                let btnClass = "btn-web";
                let btnUrl = ad.link;

                if (ad.btnType === "whatsapp") {
                    btnLabel = "WhatsApp";
                    btnClass = "btn-wa";
                    btnUrl = `https://wa.me/${ad.link.replace(/\+/g, '')}`;
                } else if (ad.btnType === "download") {
                    btnLabel = "Download";
                }

                adsHtml += `
                    <div class="market-item">
                        <div class="price-badge">${ad.price || 'Free'}</div>
                        <img src="${ad.img}" onerror="this.src='https://via.placeholder.com/150x80?text=Ad'">
                        <div class="ad-item-name">${ad.title}</div>
                        <a href="${btnUrl}" target="_blank" class="market-btn ${btnClass}">${btnLabel}</a>
                    </div>`;
            });

            adsHtml += `</div></div>`;
            adsContainer.innerHTML = adsHtml;
            
            // Onetsani malonda pakutsetsereka kuchokera mmwamba
            adsContainer.style.display = "block";

            // Bisaninso pakatha 5 seconds
            setTimeout(() => {
                adsContainer.style.display = "none";
            }, 5000);
            
        } catch (e) {
            console.log("Ads error: ", e);
        }
    }
})();