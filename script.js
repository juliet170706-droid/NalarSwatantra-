const firebaseConfig = {
    apiKey: "AIzaSyCzuYywt3E-nMaQAhzjxvs6l8ZOGyhMx2k",
    authDomain: "nalarswatantra.firebaseapp.com",
    projectId: "nalarswatantra",
    databaseURL: "https://nalarswatantra-default-rtdb.asia-southeast1.firebasedatabase.app",
    appId: "1:1043078166951:web:ff2b5dc5d597d296f5de82"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Init Editor
let quill;
if(document.getElementById('editor')) {
    quill = new Quill('#editor', { theme: 'snow', modules: { toolbar: [['bold', 'italic'], ['link'], [{ 'list': 'bullet' }]] } });
}

// LOGIN SYSTEM
window.login = () => {
    const e = document.getElementById('admEmail').value;
    const p = document.getElementById('admPass').value;
    auth.signInWithEmailAndPassword(e, p).then(() => alert("Akses Diterima!")).catch(a => alert(a.message));
};

window.logout = () => auth.signOut();

auth.onAuthStateChanged(user => {
    const gate = document.getElementById('loginGate');
    const panel = document.getElementById('adminPanel');
    if(gate && panel) {
        gate.style.display = user ? 'none' : 'block';
        panel.style.display = user ? 'block' : 'none';
        if(user) loadAdminList();
    }
});

// SAVE NEWS
window.saveNews = () => {
    const id = document.getElementById('editId').value;
    const data = {
        judul: document.getElementById('judul').value,
        isi: quill.root.innerHTML,
        barat: document.getElementById('linkBarat').value,
        timur: document.getElementById('linkTimur').value,
        netral: document.getElementById('linkNetral').value,
        time: new Date().getTime()
    };
    if(id) db.ref('berita/' + id).update(data);
    else db.ref('berita').push(data);
    alert("Berhasil!"); location.reload();
};

// LOAD CONTENT
if(document.getElementById('newsGrid')) {
    db.ref('berita').on('value', snap => {
        let h = '';
        snap.forEach(c => {
            const d = c.val();
            h += `<div class="news-card">
                <h3>${d.judul}</h3>
                <div style="font-size:0.9rem;">${d.isi}</div>
                <div class="source-wrap">
                    <a href="${d.barat}" class="src-btn">BARAT</a>
                    <a href="${d.timur}" class="src-btn">TIMUR</a>
                    <a href="${d.netral}" class="src-btn">NETRAL</a>
                </div>
            </div>`;
        });
        document.getElementById('newsGrid').innerHTML = h;
    });
}

// SEARCH
window.search = () => {
    let q = document.getElementById('searchBar').value.toLowerCase();
    document.querySelectorAll('.news-card').forEach(c => {
        c.style.display = c.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
};
