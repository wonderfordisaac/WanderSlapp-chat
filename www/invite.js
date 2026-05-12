/**
 * invite.js - Onjezera Message ndi Invite pogwiritsa ntchito pageId
 */
(function() {
    const checkAndAddBtn = setInterval(() => {
        const btnCon = document.getElementById("btnContainer");
        
        if (btnCon && btnCon.children.length > 0 && typeof pageData !== 'undefined' && typeof myID !== 'undefined') {
            
            if (document.getElementById("customInviteBtn") || document.getElementById("customMessageBtn")) {
                clearInterval(checkAndAddBtn);
                return;
            }

            btnCon.style.display = "flex";
            btnCon.style.flexDirection = "column"; 
            btnCon.style.alignItems = "flex-end"; 
            btnCon.style.gap = "8px"; 
            btnCon.style.marginTop = "10px";

            const actionWrapper = document.createElement("div");
            actionWrapper.style.display = "flex";
            actionWrapper.style.gap = "8px";

            // --- 1. MESSAGE BUTTON (pogwiritsa ntchito pageId) ---
            if (pageData.owner !== myID) {
                const messageBtn = document.createElement("button");
                messageBtn.id = "customMessageBtn";
                messageBtn.className = "action-btn btn-primary"; 
                messageBtn.innerHTML = `<i class="fi fi-sr-envelope"></i> Message`;
                
                messageBtn.onclick = function() {
                    const params = new URLSearchParams(window.location.search);
                    const pId = params.get('pageId'); // Tikuwerenga pageId pano
                    if (pId) {
                        // Tikupita ku page-massege.html ndi ?pageId=
                        window.location.href = `page-massege.html?pageId=${pId}`;
                    } else {
                        alert("Page ID haipezeka!");
                    }
                };
                actionWrapper.appendChild(messageBtn);
            }

            // --- 2. INVITE BUTTON ---
            const inviteBtn = document.createElement("button");
            inviteBtn.id = "customInviteBtn";
            inviteBtn.className = "action-btn btn-secondary";
            inviteBtn.innerHTML = `<i class="fi fi-sr-share"></i> Invite`;
            
            inviteBtn.onclick = function() {
                const params = new URLSearchParams(window.location.search);
                const pId = params.get('pageId');
                if (pId) {
                    window.location.href = `invite.html?pageId=${pId}`;
                }
            };

            actionWrapper.appendChild(inviteBtn);
            btnCon.appendChild(actionWrapper);

            clearInterval(checkAndAddBtn);
        }
    }, 1000);
})();