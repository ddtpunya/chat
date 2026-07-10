import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const roomName = document.getElementById("roomName");
const roomMembers = document.getElementById("roomMembers");
const scrollBottomBtn = document.getElementById("scrollBottomBtn");

let currentChatId = "global";
let unsubscribeChat = null;

// =========================
// HELPER
// =========================
function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function avatarURL(data = {}) {
    const name = encodeURIComponent(data.name || data.email || "User");
    return data.photo || `https://ui-avatars.com/api/?name=${name}&background=1f2a44&color=ffffff`;
}

function formatTime(timestamp) {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).replace(".", ":");
}

function isNearBottom() {
    if (!messages) return true;
    return messages.scrollHeight - messages.scrollTop - messages.clientHeight < 160;
}

// =========================
// ENTER = SEND
// =========================
if (input && sendBtn) {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });
}

// =========================
// AUTO SCROLL
// =========================
function scrollToBottom() {
    if (!messages) return;
    requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
    });
}

if (scrollBottomBtn) {
    scrollBottomBtn.addEventListener("click", scrollToBottom);
}

if (messages && scrollBottomBtn) {
    messages.addEventListener("scroll", () => {
        scrollBottomBtn.classList.toggle("show", !isNearBottom());
    });
}

// =========================
// SEND MESSAGE
// =========================
if (sendBtn) {
    sendBtn.addEventListener("click", async () => {
        const text = input.value.trim();
        if (!text) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            await addDoc(collection(db, "messages"), {
                text,
                uid: user.uid,
                name: user.displayName || user.email.split("@")[0],
                email: user.email,
                photo: user.photoURL,
                chatId: currentChatId,
                createdAt: serverTimestamp()
            });

            input.value = "";
            scrollToBottom();
        } catch (err) {
            console.error("Gagal mengirim pesan:", err);
        }
    });
}

// =========================
// LOAD MESSAGES REALTIME
// =========================
function listenToChat(chatId) {
    if (unsubscribeChat) unsubscribeChat();

    const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("createdAt")
    );

    unsubscribeChat = onSnapshot(q, (snapshot) => {
        if (!messages) return;

        const shouldAutoScroll = isNearBottom();
        messages.innerHTML = "";

        snapshot.forEach((doc) => {
            const data = doc.data();
            const me = auth.currentUser;
            if (!me) return;

            const isMe = data.uid === me.uid;
            const name = isMe ? "ANTHONY" : (data.name || "User");
            const time = formatTime(data.createdAt);
            const safeText = escapeHTML(data.text).replace(/\n/g, "<br>");

            const div = document.createElement("div");
            div.className = `message-row ${isMe ? "message-me" : ""}`;

            div.innerHTML = `
                <img class="message-avatar" src="${avatarURL(data)}" alt="avatar">

                <div class="message-content">
                    <div class="message-meta">
                        <span class="message-name">${escapeHTML(name)}</span>
                        ${time ? `<span class="message-time">${escapeHTML(time)}</span>` : ""}
                    </div>

                    <div class="message-text">${safeText}</div>

                    ${isMe ? `
                        <div class="message-seen">
                            <i class="fa-solid fa-check"></i>
                            terkirim
                        </div>
                    ` : ""}
                </div>

                <div class="message-actions">
                    <button title="Tambah"><i class="fa-solid fa-plus"></i></button>
                    <button title="Balas"><i class="fa-solid fa-reply"></i></button>
                    <button title="Pin"><i class="fa-solid fa-thumbtack"></i></button>
                </div>
            `;

            messages.appendChild(div);
        });

        if (shouldAutoScroll) scrollToBottom();
        if (scrollBottomBtn) scrollBottomBtn.classList.toggle("show", !isNearBottom());
    });
}

// =========================
// OPEN CHAT
// =========================
window.openChat = function (otherUser) {
    const me = auth.currentUser;
    if (!me) return;

    if (otherUser === "global") {
        currentChatId = "global";
        if (roomName) roomName.innerText = "GANTI G";
        if (roomMembers) roomMembers.innerText = "65 anggota";
    } else {
        currentChatId = me.uid < otherUser.uid
            ? me.uid + "_" + otherUser.uid
            : otherUser.uid + "_" + me.uid;

        if (roomName) roomName.innerText = otherUser.name;
        if (roomMembers) roomMembers.innerText = otherUser.email || "Private chat";
    }

    console.log("Kamar Chat Aktif:", currentChatId);
    listenToChat(currentChatId);
};

auth.onAuthStateChanged((user) => {
    if (user) {
        window.openChat("global");
    }
});

// ==========================================
// RESPONSIVE MOBILE
// ==========================================
const sidebar = document.querySelector(".sidebar");
const chatArea = document.querySelector(".chat");
const backBtn = document.getElementById("backToSidebarBtn");

function isMobile() {
    return window.innerWidth <= 768;
}

const originalOpenChat = window.openChat;
window.openChat = function (otherUser) {
    originalOpenChat(otherUser);

    if (isMobile() && sidebar && chatArea) {
        sidebar.style.display = "none";
        chatArea.style.display = "flex";
        if (backBtn) backBtn.style.display = "grid";
    }
};

if (backBtn) {
    backBtn.addEventListener("click", () => {
        if (isMobile() && sidebar && chatArea) {
            sidebar.style.display = "flex";
            sidebar.style.width = "100%";
            chatArea.style.display = "none";
        }
    });
}

window.addEventListener("resize", () => {
    if (!isMobile()) {
        if (sidebar) {
            sidebar.style.display = "flex";
            sidebar.style.width = "360px";
        }
        if (chatArea) chatArea.style.display = "flex";
        if (backBtn) backBtn.style.display = "none";
    } else {
        if (sidebar && chatArea && chatArea.style.display !== "flex") {
            sidebar.style.display = "flex";
            sidebar.style.width = "100%";
            chatArea.style.display = "none";
        }
    }
});
