// Theme Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});

function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('ltb_theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            
            // Add click animation
            this.style.transform = 'translateY(-50%) scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'translateY(-50%) scale(1)';
            }, 150);
        });
    }
}

function setTheme(theme) {
    const themeIcon = document.getElementById('themeIcon');
    
    // Set theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update icon
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    // Save theme preference
    localStorage.setItem('ltb_theme', theme);
    
    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

function updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    
    // Set theme color based on current theme
    if (theme === 'dark') {
        metaThemeColor.content = '#1a1a1a';
    } else {
        metaThemeColor.content = '#ffffff';
    }
}

// System theme detection
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Listen for system theme changes
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function(e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('ltb_theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Export functions for use in other scripts
window.themeManager = {
    setTheme,
    getCurrentTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
    detectSystemTheme
};