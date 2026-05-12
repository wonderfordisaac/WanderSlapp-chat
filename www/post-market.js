/**
 * Post-Market Ads Injector (Big Posters, Peek Effect & Auto-scroll)
 */
(function() {
    const marketAds = [
        { title: "Free Apps Download", img: "images/free apps.jpg", type: "website", link: "https://wanderprograms.github.io/apps/", price: "Free" },
        { title: "Recoded Mic", img: "images/recoded mic1.jpg", type: "whatsapp", link: "265990914737", price: "MK 35,000" },
        { title: "Recoded Mic", img: "images/recoded mic3.jpg", type: "whatsapp", link: "265990914737", price: "MK 35,000" },
        { title: "Recoded Mic", img: "images/recoded mic2.jpg", type: "whatsapp", link: "265990914737", price: "MK 35,000" },
        { title: "LCD sumsang galaxy S24", img: "images/LCD sumsang galaxy S24.jpg", type: "whatsapp", link: "265990914737", price: "MK 75,000" },
        { title: "Lenovo Laptop", img: "images/lenovo1.jpg", type: "whatsapp", link: "265990914737", price: "MK 450,000" },
        { title: "HP Laptop", img: "images/HP pc1.jpg", type: "whatsapp", link: "265990914737", price: "MK 550,000" },
        { title: "Samsung Galaxy M33", img: "images/Samsung_Galaxy_M33_5G_price_in.jpg", type: "whatsapp", link: "265990914737", price: "MK 450,000" }
    ];

    marketAds.sort(() => Math.random() - 0.5);

    const style = document.createElement('style');
    style.innerHTML = `
        .market-section { padding: 15px 0; background: #f9f9f9; border-bottom: 8px solid #f0f2f5; margin-top: 5px; position: relative; width: 100%; overflow: hidden; }
        .market-header { display: flex; justify-content: space-between; align-items: center; padding: 0 15px 10px; }
        .market-title { font-weight: bold; font-size: 13px; color: #65676b; text-transform: uppercase; margin: 0; }
        
        .scroll-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #0a2b4f; color: #fff; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        
        .market-slider { 
            display: flex; overflow-x: auto; gap: 12px; padding: 0 15px; 
            scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; 
            -webkit-overflow-scrolling: touch; 
        }
        .market-slider::-webkit-scrollbar { display: none; }
        
        .market-item { 
            flex: 0 0 75%; 
            max-width: 280px; 
            background: white; border-radius: 12px; overflow: hidden; 
            border: 1px solid #eee; display: flex; flex-direction: column; 
            position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.08); 
        }

        .price-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.75); color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; z-index: 2; }
        
        .market-item img { 
            width: 100%; height: 220px; 
            object-fit: contain; 
            background: #f0f2f5; 
        }
        
        .ad-item-name { 
            padding: 10px 12px 5px; 
            font-size: 14px; 
            font-weight: bold; 
            color: #1c1e21; 
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
        }

        .market-btn { border: none; padding: 12px; font-weight: bold; font-size: 13px; text-align: center; text-decoration: none; color: white; display: block; margin-top: auto; }
        .btn-wa { background: #25D366; }
        .btn-web { background: #0a2b4f; }
    `;
    document.head.appendChild(style);

    let adShown = false;
    let autoScrollTimer;

    const observer = new MutationObserver(() => {
        const feed = document.getElementById("postsFeed");
        if (!feed || adShown) return;
        const posts = feed.getElementsByClassName("post-card");
        if (posts.length >= 5) {
            injectMarketAds(posts[4]);
            adShown = true;
            observer.disconnect(); 
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function startAutoScroll(slider) {
        autoScrollTimer = setInterval(() => {
            const scrollAmount = 240; // Mtunda woti isunthe
            if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 10) {
                slider.scrollTo({ left: 0, behavior: 'smooth' }); // Bwererani poyambira
            } else {
                slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 3000); // 3 seconds
    }

    function injectMarketAds(targetPost) {
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

        marketAds.forEach(ad => {
            const btn = ad.type === "whatsapp" 
                ? `<a href="https://wa.me/${ad.link}" target="_blank" class="market-btn btn-wa">WhatsApp</a>`
                : `<a href="${ad.link}" target="_blank" class="market-btn btn-web">Visit Website</a>`;

            adsHtml += `
                <div class="market-item">
                    <div class="price-badge">${ad.price}</div>
                    <img src="${ad.img}" onerror="this.src='https://via.placeholder.com/300x200?text=Poster+Image'">
                    <div class="ad-item-name">${ad.title}</div>
                    ${btn}
                </div>`;
        });

        adsHtml += `</div>`;
        marketDiv.innerHTML = adsHtml;
        targetPost.parentNode.insertBefore(marketDiv, targetPost.nextSibling);

        const slider = document.getElementById('ad-slider-main');
        const scrollBtn = document.getElementById('manual-scroll-btn');

        // Manual scroll button
        scrollBtn.onclick = () => {
            slider.scrollBy({ left: 240, behavior: 'smooth' });
            clearInterval(autoScrollTimer); // Imitsani auto-scroll ngati user adindira button
        };

        // Yambitsani auto-scroll
        startAutoScroll(slider);

        // Imitsani auto-scroll ngati user akhudza slider
        slider.addEventListener('touchstart', () => clearInterval(autoScrollTimer), {passive: true});
        slider.addEventListener('mousedown', () => clearInterval(autoScrollTimer));

        if (typeof window.parent.postMessage === 'function') {
            window.parent.postMessage({ type: "SET_HEIGHT", height: document.body.scrollHeight }, "*");
        }
    }
})();