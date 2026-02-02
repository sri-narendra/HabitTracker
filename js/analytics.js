document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
});

async function loadAnalytics() {
    try {
        const [stats, habits, completions] = await Promise.all([
            window.api.get('/stats'),
            window.api.get('/habits'),
            window.api.get('/habits/completions')
        ]);

        updateStats(stats);
        renderConsistencyChart(habits, completions);
        renderHeatmap(completions);
        updateBadges(stats, completions);
    } catch (err) {
        console.error('Failed to load analytics:', err);
    }
}

function updateStats(stats) {
    document.getElementById('current-level').textContent = stats.level;
    document.getElementById('current-streak').textContent = `${stats.currentStreak} days`;
    document.getElementById('longest-streak').textContent = `${stats.longestStreak} days`;
    document.getElementById('total-completions').textContent = stats.totalCompletions;

    const xpForNextLevel = stats.level * 1000;
    const progress = (stats.xp % 1000) / 10; // Simple % calculation
    document.getElementById('xp-bar').style.width = `${progress}%`;
    document.getElementById('xp-text').textContent = `${stats.xp} / ${xpForNextLevel} XP`;
}

function renderConsistencyChart(habits, completions) {
    const container = document.getElementById('consistency-chart');
    if (habits.length === 0) {
        container.innerHTML = '<p class="text-secondary">No habit data available.</p>';
        return;
    }

    const data = habits.map(habit => {
        const count = completions.filter(c => c.habitId === habit._id).length;
        return { name: habit.name, count };
    });

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const barWidth = 40;
    const gap = 20;
    const height = 250;

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${data.length * (barWidth + gap)} ${height}">`;
    data.forEach((d, i) => {
        const barHeight = (d.count / maxCount) * (height - 50);
        const x = i * (barWidth + gap);
        const y = height - barHeight - 30;

        svg += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="#ffffff" opacity="0.8">
                <title>${d.name}: ${d.count} completions</title>
            </rect>
            <text x="${x + barWidth / 2}" y="${height - 10}" font-size="10" fill="var(--text-secondary)" text-anchor="middle">${d.name.substring(0, 6)}...</text>
        `;
    });
    svg += '</svg>';
    container.innerHTML = svg;
}

function renderHeatmap(completions) {
    const container = document.getElementById('heatmap');
    container.innerHTML = '';
    
    const today = new Date();
    const dates = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }

    dates.forEach(date => {
        const hasCompletion = completions.some(c => c.date === date);
        const cell = document.createElement('div');
        cell.className = `heatmap-cell ${hasCompletion ? 'active' : ''}`;
        cell.title = date;
        container.appendChild(cell);
    });
}

function updateBadges(stats, completions) {
    if (stats.currentStreak >= 7) document.getElementById('badge-streak-7')?.classList.add('earned');
    if (stats.currentStreak >= 30) document.getElementById('badge-streak-30')?.classList.add('earned');
    if (stats.level >= 10) document.getElementById('badge-level-10')?.classList.add('earned');
}

document.getElementById('export-csv').addEventListener('click', () => {
    // Basic CSV export logic
    const data = [
        ['Habit', 'Date', 'Category'],
        // Mock data or fetch real data
    ];
    let csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "habit_flow_data.csv");
    document.body.appendChild(link);
    link.click();
});
