import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

// =========================
// EMAIL YANG BOLEH LOGIN
// =========================
// Isi email yang diizinkan login di sini.
// Jangan kosongkan kalau fitur whitelist mau dipakai.
const ALLOWED_EMAILS = [
    "verensmb@gmail.com",
    "anthonyan4556@gmail.com",
];

// =========================
// ELEMENT
// =========================
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userList = document.getElementById("userList");
const myName = document.getElementById("myName");
const myPhoto = document.getElementById("myPhoto");

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");

// =========================
// CEK EMAIL WHITELIST
// =========================
function isEmailAllowed(email) {
    if (!email) return false;

    return ALLOWED_EMAILS
        .map(item => item.toLowerCase().trim())
        .includes(email.toLowerCase().trim());
}

// =========================
// LOGIN GOOGLE
// =========================
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        try {
            console.log("Login Google diklik");

            const provider = new GoogleAuthProvider();

            // Selalu tampilkan pilihan akun Google
            provider.setCustomParameters({
                prompt: "select_account"
            });

            await signInWithPopup(auth, provider);

        } catch (e) {
            console.error("Login Google gagal:", e.code, e.message);
            alert("Login gagal: " + e.message);
        }
    });
}

// =========================
// LOGOUT
// =========================
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            location.reload();
        } catch (e) {
            console.error("Logout gagal:", e);
            alert("Logout gagal: " + e.message);
        }
    });
}

// =========================
// RENDER USER LIST
// =========================
function renderUsers(me) {
    if (!userList) return;

    onSnapshot(collection(db, "users"), (snapshot) => {
        userList.innerHTML = "";

        // Tombol Global Chat
        const globalDiv = document.createElement("div");
        globalDiv.className = "group-item";
        globalDiv.innerHTML = `
            <div class="icon-btn" style="display:flex;align-items:center;justify-content:center;border-radius:50%;">
                <i class="fa-solid fa-earth-americas"></i>
            </div>

            <div class="group-info">
                <div class="group-name">Global Chat</div>
                <div class="group-desc">Obrolan Publik</div>
            </div>
        `;

        globalDiv.onclick = () => {
            if (window.openChat) {
                window.openChat("global");
            }
        };

        userList.appendChild(globalDiv);

        // List user lain
        snapshot.forEach((d) => {
            const data = d.data();

            if (!data || data.uid === me.uid) return;

            const div = document.createElement("div");
            div.className = "group-item";

            const name = data.name || "User";
            const photo =
                data.photo ||
                "https://ui-avatars.com/api/?name=" + encodeURIComponent(name);

            div.innerHTML = `
                <img src="${photo}" alt="avatar">

                <div class="group-info">
                    <div class="group-name">${name}</div>
                    <div class="group-desc">Private Chat</div>
                </div>

                <div class="group-time" style="color:#22c55e;">●</div>
            `;

            div.onclick = () => {
                if (window.openChat) {
                    window.openChat(data);
                }
            };

            userList.appendChild(div);
        });
    }, (error) => {
        console.error("Gagal mengambil daftar user:", error);
    });
}

// =========================
// AUTH STATE
// =========================
onAuthStateChanged(auth, async (user) => {
    // Jika belum login
    if (!user) {
        if (loginPage) loginPage.style.display = "flex";
        if (chatPage) chatPage.style.display = "none";
        return;
    }

    // Cek whitelist email
    if (!isEmailAllowed(user.email)) {
        alert("Akses ditolak: Email Anda tidak terdaftar!");

        await signOut(auth);

        if (loginPage) loginPage.style.display = "flex";
        if (chatPage) chatPage.style.display = "none";

        return;
    }

    // Simpan user ke Firestore
    try {
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                name: user.displayName || user.email.split("@")[0],
                email: user.email,
                photo: user.photoURL,
                lastLogin: new Date()
            },
            { merge: true }
        );
    } catch (e) {
        console.error("Gagal menyimpan user:", e);
        alert("Gagal menyimpan data user: " + e.message);
        return;
    }

    // Tampilkan halaman chat
    if (loginPage) loginPage.style.display = "none";
    if (chatPage) chatPage.style.display = "flex";

    // Update profile
    if (myName) {
        myName.innerText = user.displayName || user.email.split("@")[0];
    }

    if (myPhoto) {
        myPhoto.src =
            user.photoURL ||
            "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.email);
    }

    // Render daftar user
    renderUsers(user);
});
