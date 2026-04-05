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

// Inisialisasi Editor Tulisan
let quill;
if(document.getElementById('editor')) {
    quill = new Quill('#editor', { theme: 'snow' });
}

// FUNGSI LOGIN
window.login = () => {
    const e = document.getElementById('admEmail').value;
    const p = document.getElementById('admPass').value;
    auth.signInWithEmailAndPassword(e, p).catch(err => alert(err.message));
};

window.logout = () => auth.signOut();

// CEK STATUS LOGIN
auth.onAuthStateChanged(user => {
    const gate = document.getElementById('loginGate');
    const panel = document.getElementById('adminPanel');
    if(gate && panel) {
        gate.style.display = user ? 'none' : 'block';
        panel.style.display = user ? 'block' : 'none';
        if(user) loadAdminData();
    }
});

// SIMPAN BERITA (TAMBAH & EDIT)
window.saveNews = () => {
    const id = document.getElementById('editId').value;
    const data = {
        judul: document.getElementById('judul').value,
        isi: quill.root.innerHTML,
        barat: document.getElementById('linkBarat').value,
        timur: document.getElementById('linkTimur').value,
        netral: document.getElementById('linkNetral').value,
        tanggal: new Date().toLocaleDateString('id-ID')
    };

    if(id) {
        db.ref('berita/' + id).update(data).then(() => { alert("Update Berhasil!"); resetForm(); });
    } else {
        db.ref('berita').push(data).then(() => { alert("Analisis Terbit!"); resetForm(); });
    }
};

// SIMPAN KAMUS
window.saveDict = () => {
    const term = document.getElementById('term').value;
    const def = document.getElementById('def').value;
    db.ref('kamus').push({ istilah: term, definisi: def }).then(() => {
        alert("Kamus Berhasil Ditambah!");
        document.getElementById('term').value = "";
        document.getElementById('def').value = "";
    });
};

// LOAD DATA UNTUK DIKELOLA
function loadAdminData() {
    db.ref('berita').on('value', snap => {
        let html = '<div style="display:grid; gap:10px;">';
        snap.forEach(child => {
            const d = child.val();
            html += `
                <div style="background:#002140; padding:10px; border-radius:5px; display:flex; justify-content:space-between; align-items:center;">
                    <span>${d.judul}</span>
                    <div>
                        <button onclick="editNews('${child.key}')" style="background:orange; color:white; border:none; padding:5px;">EDIT</button>
                        <button onclick="deleteNews('${child.key}')" style="background:red; color:white; border:none; padding:5px;">HAPUS</button>
                    </div>
                </div>`;
        });
        document.getElementById('manageList').innerHTML = html + '</div>';
    });
}

// HAPUS BERITA
window.deleteNews = (id) => {
    if(confirm("Yakin mau hapus analisis ini?")) db.ref('berita/' + id).remove();
};

// EDIT BERITA (Tarik data ke atas)
window.editNews = (id) => {
    db.ref('berita/' + id).once('value', snap => {
        const d = snap.val();
        document.getElementById('editId').value = id;
        document.getElementById('judul').value = d.judul;
        quill.root.innerHTML = d.isi;
        document.getElementById('linkBarat').value = d.barat;
        document.getElementById('linkTimur').value = d.timur;
        document.getElementById('linkNetral').value = d.netral;
        window.scrollTo(0,0);
    });
};

function resetForm() {
    document.getElementById('editId').value = "";
    document.getElementById('judul').value = "";
    quill.root.innerHTML = "";
    document.getElementById('linkBarat').value = "";
    document.getElementById('linkTimur').value = "";
    document.getElementById('linkNetral').value = "";
}
