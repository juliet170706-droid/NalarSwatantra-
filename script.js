import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// KONFIGURASI FIREBASE BOS VICKY
const firebaseConfig = {
  apiKey: "AIzaSyCzuYywt3E-nMaQAhzjxvs6l8ZOGyhMx2k",
  authDomain: "nalarswatantra.firebaseapp.com",
  databaseURL: "https://nalarswatantra-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nalarswatantra",
  storageBucket: "nalarswatantra.firebasestorage.app",
  messagingSenderId: "1043078166951",
  appId: "1:1043078166951:web:ff2b5dc5d597d296f5de82"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// LOGIKA HALAMAN UTAMA (FETCH DATA)
const container = document.getElementById('newsContainer');
if (container) {
    onValue(ref(db, 'news'), (snapshot) => {
        container.innerHTML = "";
        const data = snapshot.val();
        for (let id in data) {
            const item = data[id];
            container.innerHTML += `
                <div class="news-card">
                    <small>${item.category}</small>
                    <h3>${item.title}</h3>
                    <p>${item.analysis}</p>
                    <div class="links">
                        <a href="${item.west}" target="_blank">West</a>
                        <a href="${item.east}" target="_blank">East</a>
                        <a href="${item.neutral}" target="_blank">Neutral</a>
                    </div>
                </div>
            `;
        }
    });
}

// LOGIKA ADMIN (LOGIN & POSTING)
const loginSection = document.getElementById('loginSection');
const dashSection = document.getElementById('dashboardSection');

onAuthStateChanged(auth, (user) => {
    if (user && loginSection) {
        loginSection.classList.add('hidden');
        dashSection.classList.remove('hidden');
    }
});

window.btnLogin?.addEventListener('click', () => {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Gagal Login, Bos!"));
});

window.btnPublish?.addEventListener('click', () => {
    const newsRef = ref(db, 'news');
    const newPostRef = push(newsRef);
    set(newPostRef, {
        title: document.getElementById('newsTitle').value,
        analysis: document.getElementById('newsAnalysis').value,
        west: document.getElementById('linkWest').value,
        east: document.getElementById('linkEast').value,
        neutral: document.getElementById('linkNeutral').value,
        category: document.getElementById('newsCategory').value
    }).then(() => {
        alert("Berita Terbit!");
        location.reload();
    });
});

window.btnLogout?.addEventListener('click', () => signOut(auth).then(() => location.reload()));
