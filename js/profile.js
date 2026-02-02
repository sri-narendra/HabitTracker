document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

async function loadProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const stats = await window.api.get('/stats');

        if (user) {
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('avatar-initial').textContent = user.username[0].toUpperCase();
        }

        if (stats) {
            document.getElementById('profile-level').textContent = `Level ${stats.level}`;
            document.getElementById('profile-xp').textContent = `${stats.xp} XP`;
            document.getElementById('stat-longest-streak').textContent = stats.longestStreak;
            document.getElementById('stat-total-completions').textContent = stats.totalCompletions;
        }

        renderBadges(stats);
    } catch (err) {
        console.error('Failed to load profile:', err);
    }
}

function renderBadges(stats) {
    const grid = document.getElementById('profile-badge-grid');
    const badges = [
        { name: 'Newcomer', icon: '🎉', earned: true },
        { name: '7 Day Streak', icon: '🔥', earned: stats.longestStreak >= 7 },
        { name: '30 Day Streak', icon: '🥇', earned: stats.longestStreak >= 30 },
        { name: 'Level 10', icon: '💎', earned: stats.level >= 10 },
        { name: '100 Completions', icon: '💯', earned: stats.totalCompletions >= 100 }
    ];

    grid.innerHTML = badges.map(badge => `
        <div class="badge-item ${badge.earned ? 'earned' : ''}">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        </div>
    `).join('');
}
