document.addEventListener('DOMContentLoaded', () => {
    injectLoadingSpinner();
    initTheme();
    initNavbar();
    checkServerStatus();
});

function injectLoadingSpinner() {
    if (!document.getElementById('loading-spinner')) {
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        document.body.appendChild(spinner);
    }
}

function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Update icon based on current theme
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        }
        
        toggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            const newTheme = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            if (icon) {
                icon.textContent = isDark ? 'light_mode' : 'dark_mode';
            }
        });
    }
}

function initNavbar() {
    // Logout logic - specific to ID, running independently of nav classes
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout button clicked');
            
            // Clear all auth-related data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            console.log('Redirecting to index.html');
            window.location.href = 'index.html';
        });
    } else {
        console.warn('Logout button not found');
    }

    // Highlight active link - Legacy support or if classes are added back
    const links = document.querySelectorAll('.nav-link');
    if (links.length > 0) {
        const path = window.location.pathname;
        links.forEach(link => {
            if (path.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }
}

async function checkServerStatus() {
    const indicator = document.querySelector('.status-dot');
    const text = document.querySelector('.status-text');
    
    try {
        const data = await window.api.get('/status');
        if (data.status === 'ok') {
            indicator?.classList.add('online');
            indicator?.classList.remove('offline');
            if (text) text.textContent = 'Server Online';
        }
    } catch (err) {
        indicator?.classList.add('offline');
        indicator?.classList.remove('online');
        if (text) text.textContent = 'Server Offline';
    }
}

// Utility to show/hide modals
window.toggleModal = (id, show = true) => {
    const modal = document.getElementById(id);
    if (modal) {
        if (show) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
};
