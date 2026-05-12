// --- 1. CONFIGURATION ---
const IMGBB_API_KEY = "6cd76cd441b1c0779a48c166439c8ffe"; 
const CLOUDINARY_NAME = "dtf7lxl6v"; 
const CLOUDINARY_PRESET = "slapp_preset";

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let recTimer;
let seconds = 0;

// --- 2. KUSINTHA BATANI (VOICE vs SEND) ---
function handleTyping() {
    const txt = document.getElementById("messageInput").value.trim();
    const slot = document.getElementById("actionBtnSlot");
    
    if (txt.length > 0) {
        slot.innerHTML = `<i class="fi fi-sr-paper-plane icon-btn" onclick="sendMessage()"></i>`;
    } else {
        slot.innerHTML = `<i class="fi fi-sr-microphone icon-btn" onclick="toggleRecording()"></i>`;
    }
}

// --- 3. VOICE RECORDING NDI TIMER ---
async function toggleRecording() {
    const input = document.getElementById("messageInput");
    
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                uploadVoice(audioBlob);
            };

            mediaRecorder.start();
            isRecording = true;
            seconds = 0;
            input.disabled = true;

            recTimer = setInterval(() => {
                seconds++;
                let m = Math.floor(seconds / 60).toString().padStart(2, '0');
                let s = (seconds % 60).toString().padStart(2, '0');
                input.value = `Recording... ${m}:${s}`;
            }, 1000);

        } catch (err) { alert("Lolerani Microphone chonde!"); }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        clearInterval(recTimer);
        input.disabled = false;
        input.value = "";
        handleTyping();
    }
}

// --- 4. UPLOAD MAWU KU CLOUDINARY ---
async function uploadVoice(blob) {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
            method: "POST", body: formData
        });
        const data = await res.json();
        rtdb.ref('chats').push({
            chatID: chatID, from: myID, to: activeFriendID,
            type: "voice", audioUrl: data.secure_url,
            timestamp: Date.now(), read: false
        });
    } catch (err) { console.error("Voice Error:", err); }
}

// --- 5. UPLOAD ZITHUNZI KU IMGBB ---
async function uploadImages(files) {
    for (let file of files) {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST", body: formData
            });
            const data = await res.json();
            rtdb.ref('chats').push({
                chatID: chatID, from: myID, to: activeFriendID,
                type: "image", imageUrl: data.data.url,
                timestamp: Date.now(), read: false
            });
        } catch (err) { console.error("Image Error:", err); }
    }
}

// --- 6. RENDERER (Phatikizapo Double Ticks) ---
function renderMessage(m) {
    let content = "";
    
    // Check ngati ndi uthenga wanga kapena wa mnzanga
    const isMine = (m.from === myID);
    
    // Ticks logic
    let ticks = "";
    if (isMine) {
        const color = m.read ? "#34b7f1" : "#999"; // Blue if read, Grey if not
        ticks = `<i class="fi fi-sr-check-double" style="color: ${color}; font-size: 12px; margin-left: 5px;"></i>`;
    }

    if (m.type === "voice") {
        const id = "v_" + Math.random().toString(36).substr(2, 5);
        content = `
            <div class="voice-msg">
                <i class="fi fi-sr-play icon-btn" id="btn_${id}" onclick="playAudio('${m.audioUrl}', '${id}')"></i>
                <div class="wave-anim" id="wave_${id}">
                    <span></span><span></span><span></span><span></span><span></span>
                </div>
            </div>`;
    } else if (m.type === "image") {
        content = `<img src="${m.imageUrl}" class="chat-img" onclick="showFullImg('${m.imageUrl}')">`;
    } else {
        content = `<span>${m.text || ''}</span>`;
    }

    return `
        <div style="display: flex; flex-direction: column;">
            ${content}
            <div style="align-self: flex-end; display: flex; align-items: center; margin-top: 2px;">
                <small style="font-size: 9px; opacity: 0.7;">${new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                ${ticks}
            </div>
        </div>`;
}

// --- 7. AUDIO PLAYER NDI ANIMATION ---
function playAudio(url, id) {
    const audio = new Audio(url);
    const wave = document.getElementById("wave_" + id);
    const btn = document.getElementById("btn_" + id);

    audio.play();
    wave.classList.add("playing");
    btn.classList.replace("fi-sr-play", "fi-sr-pause");

    audio.onended = () => {
        wave.classList.remove("playing");
        btn.classList.replace("fi-sr-pause", "fi-sr-play");
    };
}

// --- 8. GALLERY LOGIC ---
function showFullImg(url) {
    const gal = document.getElementById("fullScreenGal");
    const img = document.getElementById("galImg");
    img.src = url;
    gal.style.display = "flex";
}

// --- 9. SEND TEXT MESSAGE ---
function sendMessage() {
    const txt = document.getElementById("messageInput").value.trim();
    if (!txt) return;
    rtdb.ref('chats').push({
        chatID: chatID, from: myID, to: activeFriendID,
        text: txt, type: "text",
        timestamp: Date.now(), read: false
    });
    document.getElementById("messageInput").value = "";
    handleTyping();
}