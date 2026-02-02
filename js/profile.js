document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

async function loadProfile() {
    try {
        console.log('Loading profile v2...');
        const user = JSON.parse(localStorage.getItem('user'));

        if (user) {
            safeSetText('profile-username', user.username || 'User');
            safeSetText('profile-email', user.email || '');
            safeSetText('profile-avatar', (user.username || 'U')[0].toUpperCase());
            safeSetText('nav-avatar', (user.username || 'U')[0].toUpperCase());
            
            const joinDate = user.createdAt ? new Date(user.createdAt) : new Date('2023-10-12');
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            safeSetText('stat-member-since', joinDate.toLocaleDateString('en-US', options));
        }

        // Fetch Data Pattern: Match Analytics.js exactly
        // We use individual .catch() so one failure doesn't block the others
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        const startDate = yearAgo.toISOString().split('T')[0];

        const [stats, habits, completions] = await Promise.all([
            window.api.get('/stats').catch(err => {
                console.error('Stats fetch error:', err);
                return null;
            }),
            window.api.get('/habits').catch(err => {
                console.error('Habits fetch error:', err);
                return [];
            }),
            window.api.get(`/habits/completions?start=${startDate}`).catch(err => {
                console.error('Completions fetch error:', err);
                return [];
            })
        ]);

        console.log('Data loaded:', { stats, habitsCount: habits?.length, completionsCount: completions?.length });

        // Use defaults if stats missing
        const safeStats = stats || { level: 1, xp: 0, longestStreak: 0, totalCompletions: 0 };

        // --- Render Stats ---
        const levelThreshold = 1000;
        const currentLevel = safeStats.level || 1;
        const currentXP = safeStats.xp || 0;
        const xpInCurrentLevel = currentXP % levelThreshold;
        const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / levelThreshold) * 100));
        const xpRemaining = levelThreshold - xpInCurrentLevel;

        safeSetText('profile-level', `Level ${currentLevel}`);
        
        const xpEl = document.getElementById('profile-xp');
        if (xpEl) xpEl.innerHTML = `<span class="material-symbols-outlined text-primary filled-icon">star</span> ${currentXP.toLocaleString()} XP`;
        
        const progressBar = document.getElementById('xp-progress-bar');
        if (progressBar) progressBar.style.width = `${progressPercent}%`;
        safeSetText('xp-progress-text', `${progressPercent}%`);
        safeSetText('xp-remaining', `${xpRemaining} XP to next level`);

        // Cards
        safeSetText('stat-longest-streak', safeStats.longestStreak || 0); // Warning: Header ID?
        safeSetText('stat-streak', `${safeStats.longestStreak || 0} Days`);
        safeSetText('stat-lifetime-streak', `${safeStats.longestStreak || 0} Days`);
        
        safeSetText('stat-habits-completed', (safeStats.totalCompletions || 0).toLocaleString());

        if (habits) {
            safeSetText('stat-total-habits', `${habits.length} Active`);
            safeSetText('stat-habits-created', habits.length);
        }

        if (completions && habits) {
            const uniqueDates = new Set(completions.map(c => c.date));
            safeSetText('stat-active-days', uniqueDates.size);
            
            const totalOpportunities = Math.max(1, uniqueDates.size * habits.length);
            const rate = Math.min(100, Math.round(((safeStats.totalCompletions || 0) / totalOpportunities) * 100)) || 0;
            safeSetText('stat-completion-rate', `${rate}%`);
        }

        renderNewBadges(safeStats, habits);

    } catch (err) {
        console.error('Profile Load Critical Error:', err);
        alert('Error loading profile: ' + err.message);
    }
}

// Helper to safely set text content without crashing
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    } else {
        // console.warn(`Element with ID '${id}' not found`);
    }
}

function renderNewBadges(stats, habits) {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;
    
    const safeStats = stats || { longestStreak: 0, totalCompletions: 0, level: 1, xp: 0 };
    const hasHealthHabit = habits && habits.some(h => h.category === 'Health');
    const hasMentalHabit = habits && habits.some(h => h.category === 'Mental' || h.category === 'Productivity');

    const badges = [
        { name: '7-Day Warrior', icon: 'military_tech', earned: safeStats.longestStreak >= 7, desc: 'Maintain a 7-day streak' },
        { name: 'Early Bird', icon: 'wb_sunny', earned: safeStats.totalCompletions >= 10, desc: 'Complete 10 habits' },
        { name: 'Century Club', icon: 'auto_awesome', earned: safeStats.totalCompletions >= 100, desc: '100 Total Completions' },
        { name: 'Iron Will', icon: 'lock', earned: safeStats.longestStreak >= 30, desc: '30-day streak' },
        { name: 'Athlete Pro', icon: 'fitness_center', earned: hasHealthHabit && safeStats.level >= 5, desc: 'Level 5 + Health Habit' },
        { name: 'Polymath', icon: 'menu_book', earned: hasMentalHabit && safeStats.level >= 5, desc: 'Level 5 + Mental Habit' },
        { name: 'Consistency King', icon: 'rocket_launch', earned: safeStats.longestStreak >= 60, desc: '60-day streak' },
        { name: 'Diamond Status', icon: 'diamond', earned: safeStats.level >= 20 || safeStats.xp >= 20000, desc: 'Reach Level 20' }
    ];

    grid.innerHTML = badges.map(badge => `
        <div class="badge-item ${badge.earned ? 'earned' : 'badge-locked'} group relative">
            <div class="size-16 rounded-full ${badge.earned ? 'bg-primary/20 text-primary border-primary' : 'bg-slate-400/20 text-neutral-400 border-neutral-600'} flex items-center justify-center border-2 mb-3 transition-colors">
                <span class="material-symbols-outlined !text-3xl">${badge.icon}</span>
            </div>
            <div class="text-center">
                <p class="text-slate-900 dark:text-neutral-100 text-sm font-bold">${badge.name}</p>
                <p class="text-slate-500 dark:text-neutral-500 text-[10px] uppercase tracking-wide mt-1">${badge.earned ? 'Unlocked' : 'Locked'}</p>
            </div>
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">${badge.desc}</div>
        </div>
    `).join('');
}
