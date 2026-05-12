// WanderSlapp Monitization Engine - MASTER SYNC (Aggressive + Community Build Fixed)
(function() {
    let mDB, myUID;

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
                    scanEarnings();
                }
            });
        }
    }

    // --- CHOKONZEDWA CHOKHA NDI ICHI: KUTI IMVE ZOCHOKERA KU COMMENT.HTML ---
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'COMMUNITY_GROW') {
            grow(event.data.action);
        }
    });
    // ----------------------------------------------------------------------

    function showAdPopup(adData, ownerUID, postType) {
        if (window.parent) {
            window.parent.postMessage({
                type: 'SHOW_AD',
                adUrl: adData.adUrl,
                adType: adData.type
            }, '*');
        }
        let field = postType === 'video' ? 'ads_video_views' : 'ads_image_views';
        mDB.ref(`monit_stats/${ownerUID}/${field}`).transaction(v => (v || 0) + 1);
    }

    function checkAndShowAd(mediaUrl) {
        if (!mDB) return;
        mDB.ref('posts').once('value', snap => {
            snap.forEach(child => {
                const post = child.val();
                if (post.media && post.media[0].url === mediaUrl) {
                    const pid = child.key;
                    const ownerUID = post.uid;
                    mDB.ref(`ads_targeting/${pid}`).once('value', adSnap => {
                        if (adSnap.exists()) {
                            showAdPopup(adSnap.val(), ownerUID, post.media[0].type);
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
    // FIXED COMMUNITY BUILD LOGIC
    // ==========================================
    let cL = 0, cC = 0, cS = 0;

    function grow(type) {
        if (!myUID || !mDB) return;
        const statsRef = mDB.ref(`monit_stats/${myUID}`);
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

                if (Math.floor(newP / 5) > Math.floor(oldP / 5)) {
                    mDB.ref(`monit_stats/${myUID}/balance`).transaction(bal => (bal || 0) + 1);
                }
                return newP;
            });
        }
    }

    function scanEarnings() {
        if (!myUID || !mDB) return;
        mDB.ref('posts').orderByChild('uid').equalTo(myUID).on('value', snap => {
            let p = snap.numChildren(), l = 0, c = 0, s = 0, v = 0, i = 0, processed = 0;
            if (p === 0) return;
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
                        mDB.ref(`monit_stats/${myUID}`).update({ posts: p, likes: l, comments: c, shares: s, videos: v, images: i });
                    }
                });
            });
        });
    }

    const originalLike = window.toggleLike;
    window.toggleLike = function(pid, ownerID) {
        if (ownerID !== myUID) grow('like');
        if (typeof originalLike === 'function') originalLike(pid, ownerID);
    };
    const originalComm = window.openComments;
    window.openComments = function(pid, ownerID) {
        // Izi zimangotsegula iframe ya comment basi
        if (typeof originalComm === 'function') originalComm(pid, ownerID);
    };
    const originalShare = window.openShare;
    window.openShare = function(pid) {
        grow('share');
        if (typeof originalShare === 'function') originalShare(pid);
    };
})();