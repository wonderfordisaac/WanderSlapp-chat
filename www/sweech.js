// SWEECH.JS - Account Switcher (For Owners Only)
(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .nav-header {
            display: grid !important;
            grid-template-columns: 50px 1fr 50px; 
            align-items: center;
            height: 60px;
            padding: 0 10px !important;
        }

        .sweech-container {
            position: relative;
            display: flex;
            justify-content: center;
            z-index: 2000;
        }

        .sweech-btn {
            background: #0a2b4f;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 30px;
            font-weight: 800;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 15px rgba(10, 43, 79, 0.4);
            transition: 0.3s;
            max-width: 220px;
        }

        .sweech-btn span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .sweech-btn:active { transform: scale(0.95); }
        .sweech-btn i { font-size: 16px; opacity: 0.8; }

        .sweech-dropdown {
            display: none;
            position: fixed;
            top: 70px; 
            left: 50%;
            transform: translateX(-50%);
            background: white;
            width: 280px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            overflow: hidden;
            border: 1px solid #f0f2f5;
            animation: slideIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-15px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .sweech-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 14px 20px;
            cursor: pointer;
            border-bottom: 1px solid #f8f9fa;
            transition: 0.2s;
        }

        .sweech-item:hover { background: #f1f3f5; }
        .sweech-item:last-child { border-bottom: none; }

        .sweech-item img {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #0a2b4f;
        }

        .sweech-item .info {
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .sweech-item .name {
            font-size: 14px;
            font-weight: 700;
            color: #1c1e21;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .sweech-item .type {
            font-size: 11px;
            color: #65676b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .show-dd { display: block !important; }
    `;
    document.head.appendChild(style);

    const checkAuth = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            clearInterval(checkAuth);
            checkOwnership(firebase.auth().currentUser.uid);
        }
    }, 500);

    async function checkOwnership(myID) {
        const db = firebase.firestore();
        const urlParams = new URLSearchParams(window.location.search);
        
        const pageID = urlParams.get('pageId');
        const targetUID = urlParams.get('uid');

        let isOwner = false;
        let displayName = "Loading...";

        if (pageID) {
            // Check if user owns the page
            const pDoc = await db.collection("pages").doc(pageID).get();
            if (pDoc.exists) {
                const data = pDoc.data();
                if (data.owner === myID) {
                    isOwner = true;
                    displayName = data.name; // Use Page Name
                }
            }
        } else if (!targetUID || targetUID === myID) {
            // On user's own profile
            isOwner = true;
            const uDoc = await db.collection("users").doc(myID).get();
            if (uDoc.exists) displayName = uDoc.data().fullName; // Use User Name
        }

        if (isOwner) {
            renderSwitcher(myID, displayName);
        }
    }

    function renderSwitcher(myID, name) {
        const nav = document.querySelector('.nav-header');
        if (!nav) return;

        const container = document.createElement('div');
        container.className = 'sweech-container';
        container.innerHTML = `
            <button class="sweech-btn" id="sweechTrigger">
                <span>${name}</span>
                <i class="fi fi-sr-refresh"></i>
            </button>
            <div class="sweech-dropdown" id="sweechDD">
                <div style="padding: 15px; font-size: 12px; font-weight: 800; color: #0a2b4f; background: #f8f9fa; border-bottom: 1px solid #eee;">SWEECH TO ONOTHER ACOUNT</div>
                <div id="sweechList"></div>
            </div>
        `;

        const titleSpan = nav.querySelector('span');
        nav.insertBefore(container, titleSpan);

        const trigger = document.getElementById('sweechTrigger');
        const dropdown = document.getElementById('sweechDD');

        trigger.onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show-dd');
            loadAccounts(myID);
        };

        window.onclick = () => dropdown.classList.remove('show-dd');
    }

    async function loadAccounts(uid) {
        const list = document.getElementById('sweechList');
        const db = firebase.firestore();
        list.innerHTML = `<div style="padding:25px; text-align:center; font-size:13px; color:#777;">Loading...</div>`;
        
        try {
            let html = "";
            const userDoc = await db.collection("users").doc(uid).get();
            if (userDoc.exists) {
                const u = userDoc.data();
                html += `
                    <div class="sweech-item" onclick="location.href='dashboard.html'">
                        <img src="${u.profilePhoto || 'https://i.ibb.co/7z5nDqK/avatar.png'}">
                        <div class="info">
                            <span class="name">${u.fullName}</span>
                            <span class="type">main profile</span>
                        </div>
                    </div>
                `;
            }

            const pagesSnap = await db.collection("pages").where("owner", "==", uid).get();
            pagesSnap.forEach(doc => {
                const p = doc.data();
                html += `
                    <div class="sweech-item" onclick="location.href='page-dashboard.html?pageId=${doc.id}'">
                        <img src="${p.profilePhoto || 'https://i.ibb.co/7z5nDqK/avatar.png'}">
                        <div class="info">
                            <span class="name">${p.name}</span>
                            <span class="type">Page</span>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        } catch (e) {
            list.innerHTML = "<div style='padding:15px; color:red; font-size:12px;'>something long.</div>";
        }
    }
})();