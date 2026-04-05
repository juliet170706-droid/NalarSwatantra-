// Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyCzuYywt3E-nMaQAhzjxvs6l8ZOGyhMx2k',
  authDomain: 'nalarswatantra.firebaseapp.com',
  databaseURL: 'https://nalarswatantra-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'nalarswatantra',
  storageBucket: 'nalarswatantra.firebasestorage.app',
  messagingSenderId: '1043078166951',
  appId: '1:1043078166951:web:ff2b5dc5d597d296f5de82'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const searchInput = document.getElementById('searchInput');
const newsSection = document.getElementById('newsSection');
const dictionarySection = document.getElementById('dictionarySection');
const newsGrid = document.getElementById('newsGrid');
const dictionaryGrid = document.getElementById('dictionaryGrid');
const newsCount = document.getElementById('newsCount');
const dictCount = document.getElementById('dictCount');
const navLinks = document.querySelectorAll('.nav-link');
const sourceModal = document.getElementById('sourceModal');
const modalTitle = document.getElementById('modalTitle');
const modalSources = document.getElementById('modalSources');
const modalClose = document.querySelector('.modal-close');

// State
let allNews = [];
let allDictionary = [];
let filteredNews = [];
let filteredDictionary = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
    setupSearch();
});

// Navigation
function setupEventListeners() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show section
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${section}Section`).classList.add('active');
        });
    });

    modalClose.addEventListener('click', closeModal);
    sourceModal.addEventListener('click', (e) => {
        if (e.target === sourceModal) closeModal();
    });
}

// Load all data from Firebase
async function loadAllData() {
    try {
        // Load news
        const newsSnapshot = await db.ref('news').once('value');
        allNews = newsSnapshot.val() ? Object.values(newsSnapshot.val()) : [];
        
        // Load dictionary
        const dictSnapshot = await db.ref('dictionary').once('value');
        allDictionary = dictSnapshot.val() ? Object.values(dictSnapshot.val()) : [];
        
        filteredNews = [...allNews];
        filteredDictionary = [...allDictionary];
        
        renderNews();
        renderDictionary();
        updateCounts();
        
        // Replace loading states
        document.querySelectorAll('.loading-grid').forEach(grid => {
            grid.style.display = 'none';
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Gagal memuat data intelijen');
    }
}

// Real-time listeners
db.ref('news').on('value', (snapshot) => {
    const news = snapshot.val() ? Object.values(snapshot.val()) : [];
    allNews = news;
    filteredNews = news.filter(item => matchesSearch(item));
    renderNews();
    updateCounts();
});

db.ref('dictionary').on('value', (snapshot) => {
    const dict = snapshot.val() ? Object.values(snapshot.val()) : [];
    allDictionary = dict;
    filteredDictionary = dict.filter(item => matchesSearch(item));
    renderDictionary();
    updateCounts();
});

// Search functionality
function setupSearch() {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            filterData(query);
        }, 300);
    });
}

function filterData(query) {
    filteredNews = allNews.filter(item => matchesSearch(item, query));
    filteredDictionary = allDictionary.filter(item => matchesSearch(item, query));
    
    renderNews();
    renderDictionary();
    updateCounts();
}

function matchesSearch(item, query = searchInput.value.toLowerCase().trim()) {
    if (!query) return true;
    return (
        item.title?.toLowerCase().includes(query) ||
        item.analysis?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
}

// Render News
function renderNews() {
    newsGrid.innerHTML = '';
    
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Tidak ada berita ditemukan</h3>
                <p>Coba cari dengan kata kunci lain atau periksa kembali nanti</p>
            </div>
        `;
        return;
    }
    
    filteredNews.forEach((news, index) => {
        const card = createNewsCard(news, index);
        newsGrid.appendChild(card);
    });
}

function createNewsCard(news, index) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const hasSources = (news.westLink || news.eastLink || news.neutralLink);
    
    card.innerHTML = `
        <div class="category-tag">${news.category || 'Umum'}</div>
        <h3 class="news-title">${news.title}</h3>
        <div class="news-analysis">${news.analysis || ''}</div>
        ${hasSources ? `
            <div class="source-buttons">
                ${news.westLink ? `<button class="source-btn west" onclick="openSources('${news.title}', {west: '${news.westLink}'})">Barat</button>` : ''}
                ${news.eastLink ? `<button class="source-btn east" onclick="openSources('${news.title}', {east: '${news.eastLink}'})">Timur</button>` : ''}
                ${news.neutralLink ? `<button class="source-btn neutral" onclick="openSources('${news.title}', {neutral: '${news.neutralLink}'})">Netral</button>` : ''}
            </div>
        ` : ''}
    `;
    
    return card;
}

// Render Dictionary
function renderDictionary() {
    dictionaryGrid.innerHTML = '';
    
    if (filteredDictionary.length === 0) {
        dictionaryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>Tidak ada kosakata ditemukan</h3>
                <p>Coba cari dengan istilah lain</p>
            </div>
        `;
        return;
    }
    
    filteredDictionary.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'dict-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <h3 class="dict-term">${item.term}</h3>
            <div class="dict-definition">${item.definition}</div>
        `;
        
        dictionaryGrid.appendChild(card);
    });
}

function updateCounts() {
    newsCount.textContent = filteredNews.length;
    dictCount.textContent = filteredDictionary.length;
}

// Modal Functions
function openSources(title, sources) {
    modalTitle.textContent = title;
    modalSources.innerHTML = '';
    
    if (sources.west) {
        const westBtn = document.createElement('a');
        westBtn.href = sources.west;
        westBtn.target = '_blank';
        westBtn.className = 'source-link west';
        westBtn.innerHTML = '🌍 Sumber Barat';
        modalSources.appendChild(westBtn);
    }
    
    if (sources.east) {
        const eastBtn = document.createElement('a');
        eastBtn.href = sources.east;
        eastBtn.target = '_blank';
        eastBtn.className = 'source-link east';
        eastBtn.innerHTML = '🇨🇳 Sumber Timur';
        modalSources.appendChild(eastBtn);
    }
    
    if (sources.neutral) {
        const neutralBtn = document.createElement('a');
        neutralBtn.href = sources.neutral;
        neutralBtn.target = '_blank';
        neutralBtn.className = 'source-link neutral';
        neutralBtn.innerHTML = '⚖️ Sumber Netral';
        modalSources.appendChild(neutralBtn);
    }
    
    sourceModal.style.display = 'flex';
}

function closeModal() {
    sourceModal.style.display = 'none';
}

function showError(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-error';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}
