// WanderSlapp Monitization Engine - PAGE SYNC MODE
(function() {
    let mDB, myUID, currentPageID;

    // Tenga Page ID kuchokera mu URL ngati ilipo
    const urlParams = new URLSearchParams(window.location.search);
    currentPageID = urlParams.get('pageId');

    window.addEventListener('load', function() {
        setTimeout(initMonitization, 3000);
    });

    function initMonitization() {
        if (typeof firebase !== 'undefined') {
            mDB = firebase.database();
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    myUID = user.uid;
                    console.log("Monitization Linked Successfully");
                    
                    // Ngati tili pa Dashboard ya Page, scan stats za Page-yo
                    if (currentPageID) {
                        scanEarnings(currentPageID);
                    }
                }
            });
        }
    }

    // --- LISTENER YA ZOCHITIKA KU COMMENT.HTML ---
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'COMMUNITY_GROW') {
            // Ngati comment yapangidwa pa post ya Page, tumiza ku Page ID
            let targetID = event.data.pageId || currentPageID || myUID;
            grow(event.data.action, targetID);
        }
    });

    function showAdPopup(adData, ownerID, postType) {
        if (window.parent) {
            window.parent.postMessage({
                type: 'SHOW_AD',
                adUrl: adData.adUrl,
                adType: adData.type
            }, '*');
        }
        // Ads zimapatsa ndalama mwini wake wa post (Page kapena Profile)
        let field = postType === 'video' ? 'ads_video_views' : 'ads_image_views';
        mDB.ref(`monit_stats/${ownerID}/${field}`).transaction(v => (v || 0) + 1);
    }

    function checkAndShowAd(mediaUrl) {
        if (!mDB) return;
        // Yang'anani mu 'pagePosts' chifukwa ndiko kuli ma posts a Page
        mDB.ref('pagePosts').once('value', snap => {
            snap.forEach(child => {
                const post = child.val();
                if (post.media && post.media[0].url === mediaUrl) {
                    const pid = child.key;
                    // Owner pano ndi Page ID kapena User UID
                    const ownerID = post.pageId || post.uid; 
                    mDB.ref(`ads_targeting/${pid}`).once('value', adSnap => {
                        if (adSnap.exists()) {
                            showAdPopup(adSnap.val(), ownerID, post.media[0].type);
                        }
                    });
                }
            });
        });
    }

    document.addEventListener('click', function(e) {
        const el = e.target;
        if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {
            const mediaUrl = el.src;
            if (mediaUrl && !mediaUrl.includes('avatar')) {
                checkAndShowAd(mediaUrl);
            }
        }
    }, true);

    // ==========================================
    // FIXED COMMUNITY BUILD LOGIC (PAGE SENSITIVE)
    // ==========================================
    let cL = 0, cC = 0, cS = 0;

    function grow(type, targetID) {
        if (!targetID || !mDB) return;
        const statsRef = mDB.ref(`monit_stats/${targetID}`);
        let addPercent = 0;

        if (type === 'like') { 
            cL++; 
            if (cL >= 10) { addPercent = 1; cL = 0; } 
        }
        if (type === 'comment') { 
            cC++; 
            if (cC >= 3) { addPercent = 1; cC = 0; } 
        }
        if (type === 'share') { 
            cS++; 
            if (cS >= 50) { addPercent = 1; cS = 0; } 
        }

        if (addPercent > 0) {
            statsRef.child('build_community').transaction(currentPercent => {
                let oldP = currentPercent || 0;
                let newP = oldP + addPercent;
                return newP;
            });
        }
    }

    // SCAN EARNINGS YA PAGE KAPENA PROFILE
    function scanEarnings(targetID) {
        if (!targetID || !mDB) return;
        
        // Yang'anani mu 'pagePosts' ngati tikuyang'ana Page
        let dbPath = currentPageID ? 'pagePosts' : 'posts';
        let queryField = currentPageID ? 'pageId' : 'uid';

        mDB.ref(dbPath).orderByChild(queryField).equalTo(targetID).on('value', snap => {
            let p = snap.numChildren(), l = 0, c = 0, s = 0, v = 0, i = 0, processed = 0;
            if (p === 0) {
                mDB.ref(`monit_stats/${targetID}`).update({ posts: 0, likes: 0, comments: 0, shares: 0 });
                return;
            }

            snap.forEach(post => {
                const data = post.val();
                if (data.media && data.media[0]) { data.media[0].type === 'video' ? v++ : i++; }
                
                mDB.ref(`postStats/${post.key}`).once('value', st => {
                    const sv = st.val() || {};
                    if (sv.likes) l += Object.keys(sv.likes).length;
                    if (sv.comments) c += Object.keys(sv.comments).length;
                    if (sv.shares) s += Object.keys(sv.shares).length;
                    
                    processed++;
                    if (processed === p) {
                        mDB.ref(`monit_stats/${targetID}`).update({ 
                            posts: p, likes: l, comments: c, shares: s, videos: v, images: i 
                        });
                    }
                });
            });
        });
    }

    // OVERRIDE FUNCTIONS ZA FEED KUTI ZIZIPATSA PAGE NDALAMA
    const originalLike = window.toggleLike;
    window.toggleLike = function(pid, pageID) {
        let target = pageID || myUID; // Ngati palibe pageID, ndiye kuti ndi post ya profile
        if (target !== myUID || pageID) grow('like', target);
        if (typeof originalLike === 'function') originalLike(pid, pageID);
    };

    const originalShare = window.openShare;
    window.openShare = function(pid, pageID) {
        let target = pageID || myUID;
        grow('share', target);
        if (typeof originalShare === 'function') originalShare(pid);
    };
})();