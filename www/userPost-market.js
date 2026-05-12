/**
 * Post-Market Ads Injector (Big Posters, Full Visibility & Auto-Scroll)
 */
(function() {
    // 1. Kasinthidwe ka Malonda
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

    // 2. CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .market-section { padding: 15px 0; background: #f9f9f9; border-bottom: 8px solid #f0f2f5; margin-top: 5px; position: relative; }
        .market-header { display: flex; justify-content: space-between; align-items: center; padding: 0 15px 10px; }
        .market-title-main { font-weight: bold; font-size: 13px; color: #65676b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
        
        .scroll-btn { 
            display: flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; background: #0a2b4f; color: #fff; 
            border-radius: 50%; cursor: pointer; border: none; transition: 0.3s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .market-slider { 
            display: flex; overflow-x: auto; gap: 12px; padding: 0 15px; 
            scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
        .market-slider::-webkit-scrollbar { display: none; }
        
        .market-item { 
            flex: 0 0 75%; 
            max-width: 280px; 
            background: white; border-radius: 12px; 
            overflow: hidden; border: 1px solid #eee; display: flex; 
            flex-direction: column; box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            position: relative;
        }

        .price-badge {
            position: absolute; top: 10px; left: 10px;
            background: rgba(0, 0, 0, 0.75); color: white;
            padding: 5px 10px; border-radius: 6px;
            font-size: 11px; font-weight: bold; z-index: 5;
        }

        .market-item img { 
            width: 100%; height: 220px; 
            object-fit: contain; 
            background: #f0f2f5; 
        }

        .ad-product-name {
            padding: 10px 12px 5px;
            font-size: 14px;
            font-weight: bold;
            color: #1c1e21;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .market-btn { border: none; padding: 12px; font-weight: bold; font-size: 13px; cursor: pointer; text-align: center; text-decoration: none; color: white; display: block; margin-top: auto; }
        .btn-wa { background: #25D366; }
        .btn-web { background: #0a2b4f; }
    `;
    document.head.appendChild(style);

    let postCounter = 0;
    let adShown = false;
    let scrollInterval;

    const originalRenderPost = window.renderPost;

    window.renderPost = function(p) {
        if (typeof originalRenderPost === 'function') {
            originalRenderPost(p);
        }

        if (!adShown) {
            postCounter++;
            if (postCounter === 3) {
                const feed = document.getElementById("postsFeed");
                if (feed) {
                    injectMarketAds(feed);
                    adShown = true;
                }
            }
        }
    };

    function startAutoScroll(slider) {
        scrollInterval = setInterval(() => {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: 'smooth' }); // Bwererani koyamba
            } else {
                slider.scrollBy({ left: 220, behavior: 'smooth' }); // Pitani m'tsogolo
            }
        }, 3000); // Masekondi atatu aliwonse
    }

    function injectMarketAds(container) {
        const marketDiv = document.createElement("div");
        marketDiv.className = "market-section";
        
        let adsHtml = `
            <div class="market-header">
                <p class="market-title-main">Sponsored Market</p>
                <button class="scroll-btn" onclick="document.getElementById('m-slider').scrollBy(220, 0)">
                    <i class="fi fi-sr-angle-right"></i>
                </button>
            </div>
            <div class="market-slider" id="m-slider">`;

        marketAds.forEach(ad => {
            let buttonHtml = ad.type === "whatsapp" 
                ? `<a href="https://wa.me/${ad.link}" target="_blank" class="market-btn btn-wa">WhatsApp</a>`
                : `<a href="${ad.link}" target="_blank" class="market-btn btn-web">Visit Website</a>`;

            adsHtml += `
                <div class="market-item">
                    ${ad.price ? `<div class="price-badge">${ad.price}</div>` : ''}
                    <img src="${ad.img}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <div class="ad-product-name">${ad.title}</div>
                    ${buttonHtml}
                </div>`;
        });

        adsHtml += `</div>`;
        marketDiv.innerHTML = adsHtml;
        container.appendChild(marketDiv);

        const slider = marketDiv.querySelector('#m-slider');
        
        // Yambitsani Auto-scroll
        startAutoScroll(slider);

        // Ngati user agwira malonda, imitsani auto-scroll kaye
        slider.addEventListener('touchstart', () => clearInterval(scrollInterval));
        slider.addEventListener('mousedown', () => clearInterval(scrollInterval));
        
        if(typeof updateHeight === 'function') updateHeight();
    }
})();