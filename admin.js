// Firebase v9+ Modular SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
    getDatabase, 
    ref, 
    push, 
    set, 
    update, 
    remove, 
    onValue 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';
import Quill from 'https://cdn.quilljs.com/1.3.6/quill.min.js';

// Your EXACT Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyCzuYywt3E-nMaQAhzjxvs6l8ZOGyhMx2k',
  authDomain: 'nalarswatantra.firebaseapp.com',
  databaseURL: 'https://nalarswatantra-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'nalarswatantra',
  storageBucket: 'nalarswatantra.firebasestorage.app',
  messagingSenderId: '1043078166951',
  appId: '1:1043078166951:web:ff2b5dc5d597d296f5de82'
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const authStatus = document.getElementById('authStatus');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');

// Forms
const newsForm = document.getElementById('newsForm');
const dictForm = document.getElementById('dictForm');
const quillEditor = document.getElementById('quillEditor');

// Lists
const newsList = document.getElementById('newsList');
const dictList = document.getElementById('dictList');
const newsCount = document.getElementById('newsCount');
const dictCount = document.getElementById('dictCount');

// Quill
let quill;
let editingId = null;
let editingType = null;

// Initialize Quill
quill = new Quill(quillEditor, {
    theme: 'snow',
    placeholder: 'Analysis content...',
    modules: {
        toolbar: [['bold', 'italic'], ['link'], [{ 'list': 'ordered'}, { 'list': 'bullet' }]]
    }
});

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
newsForm.addEventListener('submit', handleNewsSubmit);
dictForm.addEventListener('submit', handleDictSubmit);

// CRITICAL: Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // SUCCESS: Hide login, show dashboard
        loginScreen.style.display = 'none';
        dashboardSection.style.display = 'block';
        userEmail.textContent = user.email;
        loadData();
        console.log('✅ User logged in:', user.email);
    } else {
        // LOGOUT: Show login, hide dashboard
        loginScreen.style.display = 'flex';
        dashboardSection.style.display = 'none';
        console.log('❌ No user logged in');
    }
});

// LOGIN FUNCTION WITH ALERTS
async function handleLogin(e) {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    try {
        authStatus.textContent = 'Authenticating...';
        authStatus.className = 'status-message loading';
        
        // CRITICAL: Firebase v9+ signIn
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // CRITICAL: SUCCESS ALERT
        alert(`✅ LOGIN SUCCESS!\nWelcome: ${user.email}\nDashboard unlocked...`);
        
        console.log('🎉 Login successful:', user.email);
        
    } catch (error) {
        // CRITICAL: ERROR ALERT WITH EXACT MESSAGE
        let errorMessage = 'Unknown error';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = '❌ USER NOT FOUND\nBuat user di Firebase Console dulu!';
                break;
            case 'auth/wrong-password':
                errorMessage = '❌ WRONG PASSWORD\nPassword salah!';
                break;
            case 'auth/invalid-email':
                errorMessage = '❌ INVALID EMAIL\nFormat email salah!';
                break;
            case 'auth/user-disabled':
                errorMessage = '❌ USER DISABLED\nAkun dinonaktifkan!';
                break;
            case 'auth/too-many-requests':
                errorMessage = '⏳ TOO MANY REQUESTS\nTunggu 1 menit!';
                break;
            default:
                errorMessage = `❌ ERROR: ${error.message}`;
        }
        
        alert(errorMessage);
        authStatus.textContent = errorMessage;
        authStatus.className = 'status-message error';
        console.error('Login failed:', error.code, error.message);
    }
}

function handleLogout() {
    signOut(auth);
    alert('👋 Logged out successfully!');
}

// DATA OPERATIONS
function loadData() {
    loadNewsList();
    loadDictList();
}

function loadNewsList() {
    const newsRef = ref(db, 'news');
    onValue(newsRef, (snapshot) => {
        const data = snapshot.val();
        const news = data ? Object.entries(data) : [];
        newsList.innerHTML = '';
        newsCount.textContent = news.length;
        
        news.forEach(([id, item]) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div>${item.title} (${item.category})</div>
                <button onclick="editNews('${id}', ${JSON.stringify(item)})">Edit</button>
                <button onclick="deleteNews('${id}')">Delete</button>
            `;
            newsList.appendChild(div);
        });
    });
}

function loadDictList() {
    const dictRef = ref(db, 'dictionary');
    onValue(dictRef, (snapshot) => {
        const data = snapshot.val();
        const dict = data ? Object.entries(data) : [];
        dictList.innerHTML = '';
        dictCount.textContent = dict.length;
        
        dict.forEach(([id, item]) => {
            const div = document.createElement('div');
            div.innerHTML = `
                <div>${item.term}: ${item.definition.substring(0, 50)}...</div>
                <button onclick="editDict('${id}', ${JSON.stringify(item)})">Edit</button>
                <button onclick="deleteDict('${id}')">Delete</button>
            `;
            dictList.appendChild(div);
        });
    });
}

// Forms
async function handleNewsSubmit(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('newsTitle').value,
        category: document.getElementById('newsCategory').value,
        analysis: quill.root.innerHTML,
        westLink: document.getElementById('westLink').value,
        eastLink: document.getElementById('eastLink').value,
        neutralLink: document.getElementById('neutralLink').value,
        timestamp: Date.now()
    };
    
    try {
        if (editingId) {
            await update(ref(db, `news/${editingId}`), data);
            alert('✅ News updated!');
        } else {
            await push(ref(db, 'news'), data);
            alert('✅ News created!');
        }
        newsForm.reset();
        quill.setText('');
        editingId = null;
    } catch (error) {
        alert('❌ Save failed: ' + error.message);
    }
}

async function handleDictSubmit(e) {
    e.preventDefault();
    const data = {
        term: document.getElementById('dictTerm').value,
        definition: document.getElementById('dictDefinition').value,
        timestamp: Date.now()
    };
    
    try {
        if (editingId) {
            await update(ref(db, `dictionary/${editingId}`), data);
            alert('✅ Dictionary updated!');
        } else {
            await push(ref(db, 'dictionary'), data);
            alert('✅ Dictionary added!');
        }
        dictForm.reset();
        editingId = null;
    } catch (error) {
        alert('❌ Save failed: ' + error.message);
    }
}

// Global Functions for buttons
window.editNews = (id, item) => {
    editingId = id;
    editingType = 'news';
    document.getElementById('newsTitle').value = item.title;
    document.getElementById('newsCategory').value = item.category;
    quill.root.innerHTML = item.analysis;
    document.getElementById('westLink').value = item.westLink || '';
    document.getElementById('eastLink').value = item.eastLink || '';
    document.getElementById('neutralLink').value = item.neutralLink || '';
};

window.deleteNews = async (id) => {
    if (confirm('Delete this news?')) {
        await remove(ref(db, `news/${id}`));
        alert('✅ Deleted!');
    }
};

window.editDict = (id, item) => {
    editingId = id;
    editingType = 'dict';
    document.getElementById('dictTerm').value = item.term;
    document.getElementById('dictDefinition').value = item.definition;
};

window.deleteDict = async (id) => {
    if (confirm('Delete this term?')) {
        await remove(ref(db, `dictionary/${id}`));
        alert('✅ Deleted!');
    }
};
