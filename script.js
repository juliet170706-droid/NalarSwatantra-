/**
 * Nalar Swatantra - Scroll Reveal Logic
 */
const revealElements = () => {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150; // threshold
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

// Listen for scroll
window.addEventListener('scroll', revealElements);

// Trigger once on load
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure smooth entry
    setTimeout(revealElements, 200);
});
