(function() {
    // 1. CSS - Konzani maonekedwe
    const adStyle = document.createElement('style');
    adStyle.innerHTML = `
        #ws-ad-modal-unique {
            display: none; position: fixed; top: 0; left: 0; 
            width: 100%; height: 100%; background: rgba(0, 0, 0, 0.96); 
            z-index: 9999999; flex-direction: column; align-items: center; justify-content: center;
        }
        .ws-ad-container { position: relative; width: 92%; max-width: 450px; text-align: center; display: flex; flex-direction: column; }
        #ws-ad-close {
            position: absolute; top: -50px; right: 0; background: #ff4444; color: white; 
            border: none; padding: 10px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; z-index: 100;
        }
        .ws-ad-media-box { 
            width: 100%; background: #000; border-radius: 15px 15px 0 0; 
            overflow: hidden; display: flex; justify-content: center; align-items: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .ws-ad-media-box img, .ws-ad-media-box video { width: 100%; max-height: 65vh; object-fit: contain; display: block; }
        
        .ws-ad-btn {
            width: 100%; padding: 18px; border: none; border-radius: 0 0 15px 15px;
            font-size: 20px; font-weight: 800; cursor: pointer; text-decoration: none;
            display: block; color: white; font-family: 'Segoe UI', sans-serif; 
            text-transform: uppercase;
        }
        .ws-btn-green { background: #25D366 !important; } 
        .ws-btn-blue { background: #007bff !important; }  
        
        .ws-brand-footer {
            width: 100%; text-align: right; padding: 8px; color: rgba(255,255,255,0.4);
            font-size: 10px; font-family: sans-serif; letter-spacing: 1px;
        }
    `;
    document.head.appendChild(adStyle);

    // 2. Pangani Modal mu HTML
    const adModal = document.createElement('div');
    adModal.id = 'ws-ad-modal-unique';
    adModal.innerHTML = `
        <div class="ws-ad-container">
            <button id="ws-ad-close">❌ Close</button>
            <div class="ws-ad-media-box" id="ws-media-content"></div>
            <div id="ws-btn-holder"></div>
            <div class="ws-brand-footer">WanderSlapp</div>
        </div>
    `;
    document.body.appendChild(adModal);

    // Close function
    document.getElementById('ws-ad-close').onclick = function() {
        adModal.style.display = 'none';
        document.getElementById('ws-media-content').innerHTML = ''; // Kuyimitsa video
    };

    // 3. Logic yotsegula malonda nthawi iliyonse tsamba likatsegulidwa
    function startAdEngine() {
        if (typeof firebase !== 'undefined') {
            const adsRef = firebase.database().ref('appAds');
            
            // "once" imagwira ntchito nthawi iliyonse script iyi ikuyamba (user akalowa)
            adsRef.once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const data = childSnapshot.val();
                        
                        // Khazikitsani timer yatsopano ya ad iliyonse
                        setTimeout(() => {
                            launchWanderAd(data);
                        }, data.displayTime);
                    });
                }
            });
        }
    }

    function launchWanderAd(data) {
        const mediaBox = document.getElementById('ws-media-content');
        const btnHolder = document.getElementById('ws-btn-holder');
        
        // Onetsani Chithunzi kapena Video
        if (data.adType === 'video') {
            mediaBox.innerHTML = `<video src="${data.adUrl}" autoplay playsinline controls style="width:100%"></video>`;
        } else {
            mediaBox.innerHTML = `<img src="${data.adUrl}" style="width:100%">`;
        }

        // Onetsani Button ngati munasankha mu Admin
        btnHolder.innerHTML = ""; 
        if (data.btnText && data.btnText !== "none") {
            const btn = document.createElement('button');
            btn.innerHTML = data.btnText;
            btn.className = "ws-ad-btn " + (data.btnText === "WHATSAPP" ? "ws-btn-green" : "ws-btn-blue");
            
            btn.onclick = function() {
                let finalUrl = data.btnAction;
                if (data.btnText === "WHATSAPP") {
                    finalUrl = "https://wa.me/" + data.btnAction.replace(/\D/g,'');
                }
                window.open(finalUrl, '_blank');
            };
            btnHolder.appendChild(btn);
        }

        adModal.style.display = 'flex';
    }

    // Yambitsani malonda tsamba likangomaliza kukhala ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAdEngine);
    } else {
        startAdEngine();
    }
})();