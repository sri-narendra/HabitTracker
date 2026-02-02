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
    document.documentElement.setAttribute('data-theme', theme);
    
    // Theme toggle button logic (assuming it has id theme-toggle)
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    // Highlight active link
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (path.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Logout logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
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
        if (show) modal.classList.add('active');
        else modal.classList.remove('active');
    }
};
