// 1. Dikirani kuti foni ikonzekere
document.addEventListener('deviceready', function() {

    // 2. Yatsani Background Mode (Kuti app isafe user akachoka pamanja)
    if (window.cordova && cordova.plugins.backgroundMode) {
        cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.setDefaults({ silent: true });
    }

    // 3. Mlonda wa ku Firebase (Firebase Watcher)
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const rtdb = firebase.database();
            
            // Timayang'anira ngati pali notification yatsopano yofika mu database
            rtdb.ref('notifications').orderByChild('to').equalTo(user.uid).limitToLast(1).on('child_added', snap => {
                const n = snap.val();
                
                // Ngati uthenga sunawerengedwe (read: false)
                if (n && n.read === false) {
                    // Onetsetsani uthengawo pamwamba pa foni
                    cordova.plugins.notification.local.schedule({
                        id: Math.floor(Math.random() * 1000),
                        title: "WanderSlapp",
                        text: n.message, // Uthenga ochokera mu database mwachitsanzo "John liked your post"
                        foreground: true,
                        priority: 2,
                        wakeup: true
                    });
                }
            });
        }
    });

    // 4. Ngati user adina uthenga wa pamwamba, mpatseni page ya notifications
    if (window.cordova && cordova.plugins.notification) {
        cordova.plugins.notification.local.on('click', function() {
            window.location.href = "notifications.html";
        });
    }

}, false);

