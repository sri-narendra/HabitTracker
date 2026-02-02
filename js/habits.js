document.addEventListener('DOMContentLoaded', () => {
    window.calendar.init();
    loadHabits();
});

let habits = [];
let completions = [];

// --- Local Storage Color Overlay Logic ---
function getLocalColors() {
    return JSON.parse(localStorage.getItem('habitColors') || '{}');
}

function saveLocalColor(habitId, color) {
    const colors = getLocalColors();
    colors[habitId] = color;
    localStorage.setItem('habitColors', JSON.stringify(colors));
}

async function loadHabits() {
    try {
        const year = window.calendar.getYear();
        const month = window.calendar.getMonth();
        const start = window.calendar.formatDate(year, month, 1);
        const end = window.calendar.formatDate(year, month, window.calendar.getDays());

        let [apiHabits, apiCompletions] = await Promise.all([
            window.api.get('/habits'),
            window.api.get(`/habits/completions?start=${start}&end=${end}`)
        ]);
        
        // Merge API data with local color overrides
        habits = apiHabits.map(h => ({
            ...h,
            color: getLocalColors()[h._id] || h.color || 'green'
        }));
        
        completions = apiCompletions;

        renderHabitList();
        updateStats();
    } catch (err) {
        console.error('Failed to load habits:', err);
    }
}

function updateStats() {
    if (habits.length === 0) {
        safeSetText('stat-consistency', '0%');
        safeSetText('stat-perfect-days', '0');
        safeSetText('stat-velocity', '0/wk');
        return;
    }

    const year = window.calendar.getYear();
    const month = window.calendar.getMonth();
    const totalDays = window.calendar.getDays();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const daysElapsed = isCurrentMonth ? Math.min(today.getDate(), totalDays) : totalDays;
    
    // Calculate consistency
    const totalPossibleCompletions = habits.length * daysElapsed;
    const actualCompletions = completions.length;
    const consistency = totalPossibleCompletions > 0 ? ((actualCompletions / totalPossibleCompletions) * 100).toFixed(1) : 0;
    
    // Calculate perfect days
    let perfectDays = 0;
    for (let day = 1; day <= daysElapsed; day++) {
        const dateStr = window.calendar.formatDate(year, month, day);
        const completionsOnDay = completions.filter(c => c.date === dateStr).length;
        if (completionsOnDay === habits.length && habits.length > 0) {
            perfectDays++;
        }
    }
    
    // Calculate velocity
    const weeksElapsed = daysElapsed / 7;
    const velocity = weeksElapsed > 0 ? (actualCompletions / weeksElapsed).toFixed(1) : 0;
    
    safeSetText('stat-consistency', `${consistency}%`);
    safeSetText('stat-perfect-days', perfectDays);
    safeSetText('stat-velocity', `+${velocity}/wk`);
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function renderHabitList() {
    const list = document.getElementById('habit-list');
    list.innerHTML = '';

    if (habits.length === 0) {
        list.innerHTML = `
            <tr>
                <td colspan="35" class="py-8 text-center text-accent-grey font-medium text-sm">
                    No habits found. Click "Add New Habit" to create one.
                </td>
            </tr>
        `;
        return;
    }

    habits.forEach(habit => {
        const row = document.createElement('tr');
        row.className = 'border-t border-slate-200 dark:border-border-dark/50 group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors';

        // Sticky Column
        const habitCell = document.createElement('td');
        habitCell.className = 'sticky-col px-6 py-4 border-r border-slate-200 dark:border-border-dark min-w-[280px] bg-slate-50 dark:bg-black';
        habitCell.style.minWidth = '280px';
        habitCell.style.maxWidth = '280px';
        
        const colorStyles = {
            green: { text: 'text-primary', bg: 'bg-primary/20', border: 'border-primary', ring: 'ring-primary/20' },
            blue: { text: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500', ring: 'ring-blue-500/20' },
            purple: { text: 'text-purple-500', bg: 'bg-purple-500/20', border: 'border-purple-500', ring: 'ring-purple-500/20' },
            orange: { text: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500', ring: 'ring-orange-500/20' }
        };
        const currentStyle = colorStyles[habit.color] || colorStyles.green;
        const colorClass = currentStyle.text;

        habitCell.innerHTML = `
            <div class="flex flex-col cursor-pointer" onclick="editHabit('${habit._id}')">
                <span class="text-sm font-bold text-white group-hover:${currentStyle.text} transition-colors">${habit.name}</span>
                <span class="text-[9px] font-black uppercase tracking-tighter ${colorClass} mt-1">${habit.category || 'General'}</span>
            </div>
        `;
        row.appendChild(habitCell);

        const days = window.calendar.getDays();
        const year = window.calendar.getYear();
        const month = window.calendar.getMonth();
        const todayStr = new Date().toISOString().split('T')[0];

        for (let i = 1; i <= days; i++) {
            const dateStr = window.calendar.formatDate(year, month, i);
            const isCompleted = completions.some(c => c.habitId === habit._id && c.date === dateStr);
            const isToday = dateStr === todayStr;

            const td = document.createElement('td');
            td.className = `habit-grid-cell border-r border-border-dark/20 p-1 relative habit-cell ${isToday ? 'bg-day-highlight/20' : ''}`;

            const button = document.createElement('button');
            button.className = `w-full h-full rounded flex items-center justify-center transition-all ${isCompleted ? `${currentStyle.bg} ${currentStyle.text}` : 'bg-white/5 text-transparent hover:bg-white/10'}`;
            button.onclick = (e) => toggleCompletion(habit._id, dateStr, button, e, currentStyle);
            
            button.innerHTML = `
                ${isCompleted ? '<span class="material-symbols-outlined text-sm font-black filled-icon">check</span>' : '<span class="material-symbols-outlined text-sm font-black">check</span>'}
                <div class="xp-pop" style="color: inherit">+10</div>
            `;

            td.appendChild(button);
            row.appendChild(td);
        }

        list.appendChild(row);
    });
}

async function toggleCompletion(habitId, date, button, event, style) {
    try {
        const res = await window.api.post(`/habits/${habitId}/toggle`, { date });
        
        if (res.completed) {
            button.className = `w-full h-full rounded flex items-center justify-center transition-all ${style.bg} ${style.text}`;
            button.innerHTML = '<span class="material-symbols-outlined text-sm font-black filled-icon">check</span><div class="xp-pop" style="color: inherit">+10</div>';
            showXpAnimation(event.clientX, event.clientY);
            completions.push({ habitId, date });
        } else {
            button.className = 'w-full h-full rounded flex items-center justify-center transition-all bg-white/5 text-transparent hover:bg-white/10';
            button.innerHTML = '<span class="material-symbols-outlined text-sm font-black">check</span><div class="xp-pop" style="color: inherit">+10</div>';
            completions = completions.filter(c => !(c.habitId === habitId && c.date === date));
        }
    } catch (err) {
        console.error('Toggle failed:', err);
    }
}

function showXpAnimation(x, y) {
    const anim = document.createElement('div');
    anim.className = 'xp-animation';
    anim.textContent = '+XP';
    anim.style.left = `${x}px`;
    anim.style.top = `${y}px`;
    document.body.appendChild(anim);
    setTimeout(() => anim.remove(), 1000);
}

document.getElementById('habit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('habit-id').value;
    const color = document.getElementById('habit-color').value || 'green';
    
    const habitData = {
        name: document.getElementById('habit-name').value,
        category: document.getElementById('habit-category').value,
        difficulty: document.getElementById('habit-difficulty').value,
        color: color 
    };

    try {
        let res;
        if (id) {
            res = await window.api.put(`/habits/${id}`, habitData);
            saveLocalColor(id, color);
        } else {
            res = await window.api.post('/habits', habitData);
            if (res && res._id) {
                saveLocalColor(res._id, color);
            }
        }
        window.toggleModal('habit-modal', false);
        loadHabits();
        e.target.reset();
    } catch (err) {
        alert(err.message);
    }
});

function editHabit(id) {
    const habit = habits.find(h => h._id === id);
    if (!habit) return;

    document.getElementById('modal-title').textContent = 'Edit Habit';
    document.getElementById('habit-id').value = habit._id;
    document.getElementById('habit-name').value = habit.name;
    document.getElementById('habit-category').value = habit.category;
    document.getElementById('habit-difficulty').value = habit.difficulty;
    
    const color = habit.color || 'green';
    document.getElementById('habit-color').value = color;
    const colorOption = document.querySelector(`#color-options div[data-color="${color}"]`);
    if (colorOption) window.selectColor(color, colorOption);

    document.getElementById('delete-habit-btn').style.display = 'block';
    document.getElementById('delete-habit-btn').onclick = () => deleteHabit(habit._id);
    
    window.toggleModal('habit-modal', true);
}

const originalAddBtn = document.querySelector('button[onclick*="window.toggleModal(\'habit-modal\', true)"]');
if (originalAddBtn) {
    originalAddBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Habit';
        document.getElementById('habit-id').value = '';
        document.getElementById('habit-form').reset();
        document.getElementById('delete-habit-btn').style.display = 'none';
        window.selectColor('green', document.querySelector('#color-options div[data-color="green"]'));
    });
}

async function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
        await window.api.delete(`/habits/${id}`);
        window.toggleModal('habit-modal', false);
        loadHabits();
    } catch (err) {
        alert(err.message);
    }
}

window.selectColor = function(color, el) {
    document.getElementById('habit-color').value = color;
    const container = document.getElementById('color-options');
    const options = container.children;
    for (let opt of options) {
        opt.classList.add('opacity-50');
        opt.classList.remove('border-2', 'border-white', 'ring-2', 'ring-primary/20', 'opacity-100');
    }
    el.classList.remove('opacity-50');
    el.classList.add('opacity-100', 'border-2', 'border-white', 'ring-2', 'ring-primary/20');
}

window.loadHabits = loadHabits;
