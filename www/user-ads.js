/**
 * Post-Market Ads Injector (Firebase Version)
 * Injects after 3 posts. Hides if empty. Auto-deletes expired.
 */
(function() {
    // 1. Firebase Connection
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyDt_ayoflnFkRRnS2fXITY2EzJz0KcW5QA",
            authDomain: "makert-bfb76.firebaseapp.com",
            databaseURL: "https://makert-bfb76-default-rtdb.firebaseio.com",
            projectId: "makert-bfb76",
            storageBucket: "makert-bfb76.firebasestorage.app",
            messagingSenderId: "245693362931",
            appId: "1:245693362931:web:e15662a22dd50d2ac63d86"
        });
    }
    const rtdb = firebase.database();

    // 2. CSS Styles - NDASUNGA ZANU ZIJA NDENDENDE
    const style = document.createElement('style');
    style.innerHTML = `
        .market-section { padding: 15px 0; background: #f9f9f9; border-bottom: 8px solid #f0f2f5; margin-top: 5px; position: relative; width: 100%; overflow: hidden; }
        .market-header { display: flex; justify-content: space-between; align-items: center; padding: 0 15px 10px; }
        .market-title { font-weight: bold; font-size: 13px; color: #65676b; text-transform: uppercase; margin: 0; }
        .scroll-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #0a2b4f; color: #fff; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .market-slider { display: flex; overflow-x: auto; gap: 12px; padding: 0 15px; scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .market-slider::-webkit-scrollbar { display: none; }
        .market-item { flex: 0 0 75%; max-width: 280px; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #eee; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        .price-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.75); color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; z-index: 2; }
        .market-item img { width: 100%; height: 220px; object-fit: contain; background: #f0f2f5; }
        .ad-item-name { padding: 10px 12px 5px; font-size: 14px; font-weight: bold; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .market-btn { border: none; padding: 12px; font-weight: bold; font-size: 13px; text-align: center; text-decoration: none; color: white; display: block; margin-top: auto; }
        .btn-wa { background: #25D366; }
        .btn-web { background: #0a2b4f; }
    `;
    document.head.appendChild(style);

    let adShown = false;
    let autoScrollTimer;

    // 3. Observer - Izi zikuyang'anira Feed
    const observer = new MutationObserver(() => {
        const feed = document.getElementById("postsFeed");
        if (!feed || adShown) return;
        const posts = feed.getElementsByClassName("post-card");
        
        // --- PAMBUYO PA POSTS ZITATU (3) ---
        if (posts.length >= 1) {
            injectMarketAds(posts[0]); // Posts[2] ndiyo post ya nambala 3
            adShown = true;
            observer.disconnect(); 
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    async function injectMarketAds(targetPost) {
        const now = Date.now();
        
        // 4. Tengani malonda mu Firebase
        const snapshot = await rtdb.ref("sponsoredAds").once("value");
        const adsData = snapshot.val();

        // Ngati malonda palibe, FEED IZIKHALA BWINO POPANDA CHOSOKONEZA
        if (!adsData) return;

        let validAds = [];
        for (let key in adsData) {
            let ad = adsData[key];

            // AUTO-DELETE (Chotsani mu Data ngati nthawi yatha)
            if (ad.expiry && now > ad.expiry) {
                rtdb.ref("sponsoredAds/" + key).remove();
                continue; 
            }

            // ONETSANI OKHAWO OMWE ALIPIRA (Active)
            if (ad.status === "active") {
                validAds.push(ad);
            }
        }

        // Ngati malonda onse omwe alimo si ma active, musaonetse chilichonse
        if (validAds.length === 0) return;

        validAds.sort(() => Math.random() - 0.5);

        const marketDiv = document.createElement("div");
        marketDiv.className = "market-section";
        
        let adsHtml = `
            <div class="market-header">
                <p class="market-title">Sponsored Market</p>
                <button class="scroll-btn" id="manual-scroll-btn">
                    <i class="fi fi-sr-angle-right"></i>
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
            } else if (ad.btnType === "download") {
                btnLabel = "Download";
            } else if (ad.btnType === "learn") {
                btnLabel = "Learn More";
            }

            adsHtml += `
                <div class="market-item">
                    <div class="price-badge">${ad.price || 'Free'}</div>
                    <img src="${ad.img}" onerror="this.src='https://via.placeholder.com/300x200?text=WanderSlapp+Ad'">
                    <div class="ad-item-name">${ad.title}</div>
                    <a href="${btnUrl}" target="_blank" class="market-btn ${btnClass}">${btnLabel}</a>
                </div>`;
        });

        adsHtml += `</div>`;
        marketDiv.innerHTML = adsHtml;
        targetPost.parentNode.insertBefore(marketDiv, targetPost.nextSibling);

        const slider = document.getElementById('ad-slider-main');
        const scrollBtn = document.getElementById('manual-scroll-btn');

        // MANUAL SCROLL (User athebe kukankha yekha)
        scrollBtn.onclick = () => {
            slider.scrollBy({ left: 240, behavior: 'smooth' });
            clearInterval(autoScrollTimer); 
        };

        // AUTO-SCROLL
        autoScrollTimer = setInterval(() => {
            if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 10) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: 240, behavior: 'smooth' });
            }
        }, 3000);

        // IMITSANI AUTO-SCROLL NGATI USER AKUKANKHA (Interaction)
        slider.addEventListener('touchstart', () => clearInterval(autoScrollTimer), {passive: true});
        slider.addEventListener('mousedown', () => clearInterval(autoScrollTimer));

        if (typeof window.parent.postMessage === 'function') {
            window.parent.postMessage({ type: "SET_HEIGHT", height: document.body.scrollHeight }, "*");
        }
    }
})();

