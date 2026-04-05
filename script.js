// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Stagger post cards
            if (entry.target.classList.contains('post-card')) {
                entry.target.classList.add('animate');
            }
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in, .post-card, .section-title, .vault').forEach(el => {
        observer.observe(el);
    });

    // Search interaction
    const searchInput = document.querySelector('.search-input');
    const searchIcon = document.querySelector('.search-icon');
    
    searchIcon.addEventListener('click', () => {
        searchInput.removeAttribute('readonly');
        searchInput.focus();
        searchInput.classList.add('focused');
    });
    
    searchInput.addEventListener('blur', () => {
        searchInput.setAttribute('readonly', true);
        searchInput.classList.remove('focused');
    });

    // Smooth scrolling for vault buttons
    document.querySelectorAll('.vault-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Add your modal/library logic here
            console.log('Opening:', btn.textContent);
        });
    });
});

// Performance: Remove observer when not needed
window.addEventListener('load', () => {
    // Preload critical fonts
    document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
    });
});
