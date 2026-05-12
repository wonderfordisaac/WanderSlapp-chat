/**
 * WanderSlapp Smart Notification System (Full Version)
 * Izi zimagwira ntchito mu: userpost, comment, share, ndi friend requests.
 */

async function sendSmartNotification(postOwnerID, type, postID = "general") {
    // 1. Ngati auth kapena rtdb palibe mu page-mo, isachite chilichonse
    if (typeof auth === 'undefined' || typeof rtdb === 'undefined') return;
    
    // 2. Osadziuza wekha notification
    const user = auth.currentUser;
    if (!user || user.uid === postOwnerID) return;

    const myID = user.uid;
    const notifRef = rtdb.ref('notifications');

    // 3. Pezani dzina la munthu amene akupanga action (Inu) kuchokera mu Firestore
    let myName = "Wina wake";
    try {
        const userSnap = await firebase.firestore().collection("users").doc(myID).get();
        if (userSnap.exists) {
            myName = userSnap.data().fullName;
        }
    } catch (e) { 
        console.log("Error fetching name:", e); 
    }

    // 4. Konzani mauthenga ndi ma Link malinga ndi mtundu wa notification
    let messageSuffix = "";
    let actionLink = "dashboard.html"; // Default link

    if (type === 'like') {
        messageSuffix = "like your comment.";
        actionLink = "notfication.html"; 
    } else if (type === 'comment') {
        messageSuffix = "comment your post.";
        actionLink = "notfication.html";
    } else if (type === 'share') {
        messageSuffix = "wagawira (share) post yanu.";
        actionLink = "notfication.html";
    } else if (type === 'friend_request') {
        messageSuffix = "send you friend request.";
        actionLink = "friend.html"; // Ipititse ku page ya ma request
    } else if (type === 'accept_request') {
        messageSuffix = "acceted your friend request!";
        actionLink = "friend.html";
    }

    // 5. SMART GROUPING: Fufuzani ngati pali kale notification yofanana yomwe isanawerengedwe
    // GroupKey imathandiza kuti mauthenga a post imodzi asakhale ambiri ambiri
    const groupKey = `${postID}_${type}`;
    const existingSnap = await notifRef.orderByChild('groupKey').equalTo(groupKey).once('value');

    let alreadyExists = false;
    let existingID = null;
    let existingData = null;

    existingSnap.forEach(child => {
        const d = child.val();
        // Check ngati uthengawo ndi wa munthu yemweyo (to) komanso sunawerengedwe (read: false)
        if (d.to === postOwnerID && d.read === false) {
            alreadyExists = true;
            existingID = child.key;
            existingData = d;
        }
    });

    if (alreadyExists) {
        // Ngati si inu amene munapanga notification ija poyamba
        if (existingData.from !== myID) {
            let count = (existingData.othersCount || 0) + 1;
            let groupedMessage = `${myName} with other ${count} ${messageSuffix}`;

            await notifRef.child(existingID).update({
                message: groupedMessage,
                read: false, // Izi zipangitsa kuti Badge ya pa Dashboard iyake kachiwiri
                timestamp: Date.now(),
                othersCount: count
            });
        }
    } else {
        // Panga notification yatsopano ngati palibe ina yofanana yomwe isanawerengedwe
        await notifRef.push({
            to: postOwnerID,
            from: myID,
            message: `${myName} ${messageSuffix}`,
            type: type,
            groupKey: groupKey,
            othersCount: 0,
            read: false,
            timestamp: Date.now(),
            link: actionLink
        });
    }
}



