// Firebase Config (same as main)
const firebaseConfig = {
  apiKey: 'AIzaSyCzuYywt3E-nMaQAhzjxvs6l8ZOGyhMx2k',
  authDomain: 'nalarswatantra.firebaseapp.com',
  databaseURL: 'https://nalarswatantra-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'nalarswatantra',
  storageBucket: 'nalarswatantra.firebasestorage.app',
  messagingSenderId: '1043078166951',
  appId: '1:1043078166951:web:ff2b5dc5d597d296f5de82'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const newsForm = document.getElementById('newsForm');
const dictForm = document.getElementById('dictForm');
const newsList = document.getElementById('newsList');
const dictList = document.getElementById('dictList');
const newsListCount = document.getElementById('newsListCount');
const dictListCount = document.getElementById('dictListCount');

// Quill Editor
let quill;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initQuill();
    setupEventListeners();
    checkAuth();
});

// Auth
auth.onAuthStateChanged((user) => {
    if (user) {
        showDashboard(user);
        loadAdminData();
    } else {
        showLogin();
    }
});

function initQuill() {
    const quillElement = document.getElementById('quillEditor');
    quill = new Quill(quillElement, {
        theme: 'snow',
        placeholder: 'Analisis intelijen (gunakan bold/italic untuk penekanan)',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                ['link'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }]
            ]
        }
    });
}

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    newsForm.addEventListener('submit', handleNewsSubmit);
    dictForm.addEventListener('submit', handleDictSubmit);
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        loginError.textContent = '';
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        loginError.textContent = 'Email atau password salah';
    }
}

function handleLogout() {
    auth.signOut();
}

function showDashboard(user) {
    loginScreen.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    userEmail.textContent = user.email;
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
}

// News Form
async function handleNewsSubmit(e) {
    e.preventDefault();
    const newsData = {
        title: document.getElementById('newsTitle').value,
        analysis: quill.root.innerHTML,
        westLink: document.getElementById('westLink').value,
        eastLink: document.getElementById('eastLink').value,
        neutralLink: document.getElementById('neutralLink').value,
        category: 'Umum', // Can be extended
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    try {
        const newNewsRef = db.ref('news').push();
        await newNewsRef.set(newsData);
        
        // Reset form
        newsForm.reset();
        quill.setText('');
        
        showNotification('Berita berhasil disimpan');
    } catch (error) {
        console.error('Error saving news:', error);
        showNotification('Gagal menyimpan berita', 'error');
    }
}

// Dictionary Form
async function handleDictSubmit(e) {
    e.preventDefault();
    const dictData = {
        term: document.getElementById('dictTerm').value,
        definition: document.getElementById('dictDefinition').value,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    try {
        const newDictRef = db.ref('dictionary').push();
        await newDictRef.set(dictData);
        
        // Reset form
        dictForm.reset();
        
        showNotification('Kosakata berhasil disimpan');
    } catch (error) {
        console.error('Error saving dictionary:', error);
        showNotification('Gagal menyimpan kosakata', 'error');
    }
}

// Load Admin Data
async function loadAdminData() {
    loadNewsList();
    loadDictList();
}

function loadNewsList() {
    db.ref('news').on('value', (snapshot) => {
        const news = snapshot.val();
        newsList.innerHTML = '';
        let count = 0;
        
        if (news) {
            Object.entries(news).forEach(([id, item]) => {
                createAdminListItem(newsList, id, item, 'news');
                count++;
            });
        }
        
        newsListCount.textContent = `(${count})`;
    });
}

function loadDictList() {
    db.ref('dictionary').on('value', (snapshot) => {
        const dict = snapshot.val();
        dictList.innerHTML = '';
        let count = 0;
        
        if (dict) {
            Object.entries(dict).forEach(([id, item]) => {
                createAdminListItem(dictList, id, item, 'dictionary');
                count++;
            });
        }
        
        dictListCount.textContent = `(${count})`;
    });
}

function createAdminListItem(container, id, item, type) {
    const listItem = document.createElement('div');
    listItem.className = 'admin-list-item';
    
    listItem.innerHTML = `
        <div class="list-content">
            <h4>${item.title || item.term}</h4>
            <p>${item.analysis ? item.analysis.substring(0, 100) + '...' : item.definition.substring(0, 100) + '...'}</p>
        </div>
        <div class="list-actions">
            <button class="edit-btn" onclick="editItem('${id}', ${JSON.stringify(item).replace(/"/g, '&quot;')}, '${type}')">Edit</button>
            <button class="delete-btn" onclick="deleteItem('${id}', '${type}')">Hapus</button>
        </div>
    `;
    
    container.appendChild(listItem);
}

// CRUD Operations
async function deleteItem(id, type) {
    if (confirm(`Hapus ${type === 'news' ? 'berita' : 'kosakata'} ini?`)) {
        try {
            await db.ref(`${type}/${id}`).remove();
            showNotification('Item berhasil dihapus');
        } catch (error) {
            console.error('Error deleting:', error);
            showNotification('Gagal menghapus', 'error');
        }
    }
}

function editItem(id, itemData, type) {
    // Populate form with data
    if (type === 'news') {
        document.getElementById('newsTitle').value = itemData.title;
        quill.root.innerHTML = itemData.analysis;
        document.getElementById('westLink').value = itemData.westLink || '';
        document.getElementById('eastLink').value = itemData.eastLink || '';
        document.getElementById('neutralLink').value = itemData.neutralLink || '';
        
        // Change form to update mode
        newsForm.onsubmit = async (e) => {
            e.preventDefault();
            await updateItem(id, type);
        };
    } else {
        document.getElementById('dictTerm').value = itemData.term;
        document.getElementById('dictDefinition').value = itemData.definition;
        
        dictForm.onsubmit = async (e) => {
            e.preventDefault();
            await updateItem(id, type);
        };
    }
}

async function updateItem(id, type) {
    let updateData;
    
    if (type === 'news') {
        updateData = {
            title: document.getElementById('newsTitle').value,
            analysis: quill.root.innerHTML,
            westLink: document.getElementById('westLink').value,
            eastLink: document.getElementById('eastLink').value,
            neutralLink: document.getElementById('neutralLink').value,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
    } else {
        updateData = {
            term: document.getElementById('dictTerm').value,
            definition: document.getElementById('dictDefinition').value,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
    }
    
    try {
        await db.ref(`${type}/${id}`).update(updateData);
        showNotification('Item berhasil diupdate');
        resetForms();
    } catch (error) {
        console.error('Error updating:', error);
        showNotification('Gagal mengupdate', 'error');
    }
}

function resetForms() {
    newsForm.reset();
    dictForm.reset();
    quill.setText('');
    newsForm.onsubmit = handleNewsSubmit;
    dictForm.onsubmit = handleDictSubmit;
}

function checkAuth() {
    auth.onAuthStateChanged((user)
