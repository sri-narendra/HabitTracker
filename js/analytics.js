// Helper to get YYYY-MM-DD in local timezone
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
});

async function loadAnalytics() {
    try {
        const [stats, habits] = await Promise.all([
            window.api.get('/stats'),
            window.api.get('/habits')
        ]);

        // Get completions for the past year for heatmap
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        const completions = await window.api.get(`/habits/completions?start=${getLocalDateString(yearAgo)}`);
        
        // Cache for toggles
        window.cachedCompletions = completions;

        updateStats(stats, habits);
        renderConsistencyChart(completions);
        renderTrendChart(completions);
        renderHeatmap(completions);
        updateBadges(stats);
    } catch (err) {
        console.error('Failed to load analytics:', err);
    }
}

// ... (keep updateStats as is, it doesn't use dates for filtering) ...
// Actually, I need to include updateStats to keep the file valid if replace_file_content is partial?
// "To edit a single instance... range should such that it contains that specific instance..."
// I will use replace_file_content on specific blocks or overwrite if easier.
// Since there are multiple toISOString calls scattered, replacing the whole file with corrected logic might be cleaner or multiple chunks.
// Multi-chunk replacement is safer for large files if I only touch specific functions.
// I will use multi_replace.

function renderConsistencyChart(completions) {
    const container = document.getElementById('consistency-chart');
    const labelsContainer = document.getElementById('consistency-labels');
    
    // Get last 7 days
    const days = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        const count = completions.filter(c => c.date === dateStr).length;
        days.push({
            date: dateStr,
            count: count,
            label: dayLabels[date.getDay()]
        });
    }
    
    const maxCount = Math.max(...days.map(d => d.count), 1);
    
    // Render bars
    container.innerHTML = days.map(day => {
        const height = (day.count / maxCount) * 100;
        const isToday = day.date === getLocalDateString(today);
        return `<div class="w-full ${isToday ? 'bg-primary' : 'bg-primary/20'} hover:bg-primary transition-colors rounded-t-md cursor-pointer" style="height: ${height}%" title="${day.count} completions"></div>`;
    }).join('');
    
    // Render labels
    labelsContainer.innerHTML = days.map(day => `<span>${day.label}</span>`).join('');
}

function renderTrendChart(completions) {
    const svg = document.getElementById('trend-chart');
    
    // Get last 30 days
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        const count = completions.filter(c => c.date === dateStr).length;
        days.push(count);
    }
    
    const maxCount = Math.max(...days, 1);
    
    // Create path
    let pathData = '';
    days.forEach((count, index) => {
        const x = (index / 29) * 100;
        const y = 100 - ((count / maxCount) * 80);
        pathData += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    // Create gradient fill path
    let fillPath = pathData + ` L 100 100 L 0 100 Z`;
    
    svg.innerHTML = `
        <defs>
            <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style="stop-color:#19e65e;stop-opacity:1"></stop>
                <stop offset="100%" style="stop-color:#19e65e;stop-opacity:0"></stop>
            </linearGradient>
        </defs>
        <path d="${fillPath}" fill="url(#gradient)" opacity="0.2"></path>
        <path d="${pathData}" fill="none" stroke="#19e65e" stroke-linecap="round" stroke-width="3"></path>
    `;
}

function renderHeatmap(completions) {
    const container = document.getElementById('heatmap-grid');
    container.innerHTML = '';
    
    // Generate 52 weeks of data
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (52 * 7));
    
    // Create a map of dates to completion counts
    const completionMap = {};
    completions.forEach(c => {
        completionMap[c.date] = (completionMap[c.date] || 0) + 1;
    });
    
    // Find max completions for color scaling
    const maxCompletions = Math.max(...Object.values(completionMap), 1);
    
    // Generate 52 weeks
    for (let week = 0; week < 52; week++) {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'flex flex-col gap-1';
        
        // Generate 7 days per week
        for (let day = 0; day < 7; day++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + (week * 7) + day);
            const dateStr = getLocalDateString(date);
            const count = completionMap[dateStr] || 0;
            
            let colorClass = 'bg-slate-100 dark:bg-background-dark';
            if (count > 0) {
                const intensity = count / maxCompletions;
                if (intensity >= 0.9) colorClass = 'bg-primary';
                else if (intensity >= 0.6) colorClass = 'bg-primary/70';
                else if (intensity >= 0.3) colorClass = 'bg-primary/40';
                else colorClass = 'bg-primary/20';
            }
            
            const cell = document.createElement('div');
            cell.className = `heatmap-cell ${colorClass}`;
            cell.title = `${dateStr}: ${count} completions`;
            weekDiv.appendChild(cell);
        }
        
        container.appendChild(weekDiv);
    }
}

function updateStats(stats, habits) {
    // User Level
    document.getElementById('user-level').textContent = `Lvl ${stats.level || 1}`;
    
    // XP Progress
    const xpForNextLevel = (stats.level || 1) * 1000;
    const currentXP = stats.xp || 0;
    const xpInLevel = currentXP % 1000;
    const progress = (xpInLevel / 1000) * 100;
    
    document.getElementById('xp-display').textContent = `${xpInLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`;
    document.getElementById('xp-percentage').textContent = `${progress.toFixed(0)}% to Level ${(stats.level || 1) + 1}`;
    document.getElementById('xp-bar').style.width = `${progress}%`;
    
    // Current Streak
    const currentStreak = stats.currentStreak || 0;
    document.getElementById('current-streak').textContent = `${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`;
    if (currentStreak > 0) {
        document.getElementById('streak-change').innerHTML = `<span class="material-symbols-outlined text-xs">trending_up</span> Keep it going!`;
        document.getElementById('streak-change').className = 'text-primary text-sm font-bold flex items-center gap-1';
    } else {
        document.getElementById('streak-change').textContent = 'Start your streak today';
    }
    
    // Longest Streak
    const longestStreak = stats.longestStreak || 0;
    document.getElementById('longest-streak').textContent = `${longestStreak} Day${longestStreak !== 1 ? 's' : ''}`;
    
    // Total Habits
    const totalHabits = habits.length;
    document.getElementById('total-habits').textContent = `${totalHabits} Active`;
    document.getElementById('habits-change').textContent = totalHabits > 0 ? 'Building consistency' : 'Create your first habit';
    
    // Completion Rate (this month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = today.getDate();
    const possibleCompletions = totalHabits * daysInMonth;
    const actualCompletions = stats.totalCompletions || 0;
    const completionRate = possibleCompletions > 0 ? ((actualCompletions / possibleCompletions) * 100).toFixed(0) : 0;
    
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    document.getElementById('completion-trend').textContent = 'This month';
}

let currentConsistencyPeriod = 'daily';

function renderConsistencyChart(completions, period = 'daily') {
    const container = document.getElementById('consistency-chart');
    const labelsContainer = document.getElementById('consistency-labels');
    
    const days = [];
    const today = new Date();
    
    if (period === 'daily') {
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(date);
            const count = completions.filter(c => c.date === dateStr).length;
            days.push({
                date: dateStr,
                count: count,
                label: dayLabels[date.getDay()]
            });
        }
    } else {
        // Weekly View (Last 12 weeks)
        for (let i = 11; i >= 0; i--) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (i * 7) - today.getDay()); // Start of week (Sunday)
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            let count = 0;
            // Filter completions within this week range
            // We use simple string comp for dates YYYY-MM-DD
            const startStr = getLocalDateString(weekStart);
            const endStr = getLocalDateString(weekEnd);
            
            count = completions.filter(c => c.date >= startStr && c.date <= endStr).length;
            
            days.push({
                date: startStr, // Identifier
                count: count,
                label: `${weekStart.getMonth()+1}/${weekStart.getDate()}`
            });
        }
    }
    
    const maxCount = Math.max(...days.map(d => d.count), 1);
    
    // Render bars
    container.innerHTML = days.map(day => {
        const height = (day.count / maxCount) * 100;
        // Highlight current day/week
        let isCurrent = false;
        if (period === 'daily') isCurrent = day.date === getLocalDateString(today);
        // For weekly, simplistic check: is "this week" included? 
        // Logic above aligns week 0 to "this week". i=0 is this week.
        // But map iteration loses index.
        // We can check if day.date is close to today.
        // Let's just highlight the last bar as current?
        // Actually, logic is fine without highlight for weekly for now.
        
        return `<div class="w-full ${isCurrent ? 'bg-primary' : 'bg-primary/20'} hover:bg-primary transition-colors rounded-t-md cursor-pointer group relative" style="height: ${height}%">
            ${height > 10 ? `<span class="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">${day.count}</span>` : ''}
        </div>`;
    }).join('');
    
    // Render labels (every 2nd label if weekly to save space?)
    labelsContainer.innerHTML = days.map((day, idx) => {
        if (period === 'weekly' && idx % 2 !== 0 && days.length > 8) return `<span></span>`; // Skip some labels
        return `<span>${day.label}</span>`;
    }).join('');
}

function renderTrendChart(completions) {
    const svg = document.getElementById('trend-chart');
    
    // Get last 30 days
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        const count = completions.filter(c => c.date === dateStr).length;
        days.push(count);
    }
    
    const maxCount = Math.max(...days, 1);
    
    // Create path
    let pathData = '';
    days.forEach((count, index) => {
        const x = (index / 29) * 100;
        const y = 100 - ((count / maxCount) * 80);
        pathData += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    // Create gradient fill path
    let fillPath = pathData + ` L 100 100 L 0 100 Z`;
    
    svg.innerHTML = `
        <defs>
            <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style="stop-color:#19e65e;stop-opacity:1"></stop>
                <stop offset="100%" style="stop-color:#19e65e;stop-opacity:0"></stop>
            </linearGradient>
        </defs>
        <path d="${fillPath}" fill="url(#gradient)" opacity="0.2"></path>
        <path d="${pathData}" fill="none" stroke="#19e65e" stroke-linecap="round" stroke-width="3"></path>
    `;
}

function renderHeatmap(completions) {
    const container = document.getElementById('heatmap-grid');
    container.innerHTML = '';
    
    // Generate 52 weeks of data
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (52 * 7));
    
    // Create a map of dates to completion counts
    const completionMap = {};
    completions.forEach(c => {
        completionMap[c.date] = (completionMap[c.date] || 0) + 1;
    });
    
    // Find max completions for color scaling
    const maxCompletions = Math.max(...Object.values(completionMap), 1);
    
    // Generate 52 weeks
    for (let week = 0; week < 52; week++) {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'flex flex-col gap-1';
        
        // Generate 7 days per week
        for (let day = 0; day < 7; day++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + (week * 7) + day);
            const dateStr = getLocalDateString(date);
            const count = completionMap[dateStr] || 0;
            
            let colorClass = 'bg-slate-100 dark:bg-background-dark';
            if (count > 0) {
                const intensity = count / maxCompletions;
                if (intensity >= 0.9) colorClass = 'bg-primary';
                else if (intensity >= 0.6) colorClass = 'bg-primary/70';
                else if (intensity >= 0.3) colorClass = 'bg-primary/40';
                else colorClass = 'bg-primary/20';
            }
            
            const cell = document.createElement('div');
            cell.className = `heatmap-cell ${colorClass}`;
            cell.title = `${dateStr}: ${count} completions`;
            weekDiv.appendChild(cell);
        }
        
        container.appendChild(weekDiv);
    }
}

function updateBadges(stats) {
    const container = document.getElementById('badges-grid');
    
    const badges = [
        {
            id: 'streak-7',
            name: '7-Day Warrior',
            icon: 'bolt',
            unlocked: (stats.currentStreak || 0) >= 7,
            unlockedDate: 'Recently',
            requirement: 'Reach 7-day streak'
        },
        {
            id: 'early-bird',
            name: 'Early Bird',
            icon: 'wb_sunny',
            unlocked: (stats.level || 0) >= 5,
            unlockedDate: 'Recently',
            requirement: 'Reach Level 5'
        },
        {
            id: 'habit-hero',
            name: 'Habit Hero',
            icon: 'rocket_launch',
            unlocked: (stats.totalCompletions || 0) >= 50,
            unlockedDate: 'Recently',
            requirement: 'Complete 50 habits'
        },
        {
            id: 'consistency-king',
            name: 'Consistency King',
            icon: 'lock',
            unlocked: (stats.longestStreak || 0) >= 100,
            unlockedDate: null,
            requirement: 'Reach 100 streak'
        },
        {
            id: 'top-club',
            name: 'Top 1% Club',
            icon: 'social_leaderboard',
            unlocked: false,
            unlockedDate: null,
            requirement: 'Monthly rank #1'
        },
        {
            id: 'grand-master',
            name: 'Grand Master',
            icon: 'military_tech',
            unlocked: (stats.level || 0) >= 50,
            unlockedDate: null,
            requirement: 'Reach Level 50'
        }
    ];
    
    container.innerHTML = badges.map(badge => {
        if (badge.unlocked) {
            return `
                <div class="flex flex-col items-center p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark text-center gap-3">
                    <div class="size-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                        <span class="material-symbols-outlined text-3xl text-primary filled-icon">${badge.icon}</span>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs font-extrabold uppercase tracking-tight">${badge.name}</p>
                        <p class="text-[10px] text-slate-400">Unlocked ${badge.unlockedDate}</p>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-center p-4 rounded-xl bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark/50 text-center gap-3 opacity-50">
                    <div class="size-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-400 dark:border-slate-700">
                        <span class="material-symbols-outlined text-3xl text-slate-500">${badge.icon}</span>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs font-extrabold uppercase tracking-tight">${badge.name}</p>
                        <p class="text-[10px] text-slate-400">${badge.requirement}</p>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Chart period toggle
// Chart period toggle
document.addEventListener('click', (e) => {
    if (e.target.dataset.period) {
        const period = e.target.dataset.period;
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.className = 'px-3 text-xs font-medium text-slate-500 hover:text-primary transition-colors';
        });
        e.target.className = 'px-3 text-xs font-bold rounded-md bg-white dark:bg-card-dark shadow-sm';
        
        // Reload chart
        // We need 'completions' data here. 
        // Simpler to make 'completions' global or re-fetch?
        // Re-fetching is expensive.
        // I will make 'cachedCompletions' global at top.
        if (window.cachedCompletions) {
            renderConsistencyChart(window.cachedCompletions, period);
        }
    }
});
