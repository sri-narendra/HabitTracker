document.addEventListener('DOMContentLoaded', () => {
    window.calendar.init();
    loadHabits();
});

let habits = [];
let completions = [];

async function loadHabits() {
    try {
        const year = window.calendar.getYear();
        const month = window.calendar.getMonth();
        const start = window.calendar.formatDate(year, month, 1);
        const end = window.calendar.formatDate(year, month, window.calendar.getDays());

        [habits, completions] = await Promise.all([
            window.api.get('/habits'),
            window.api.get(`/habits/completions?start=${start}&end=${end}`)
        ]);

        renderHabitList();
    } catch (err) {
        console.error('Failed to load habits:', err);
    }
}

function renderHabitList() {
    const list = document.getElementById('habit-list');
    list.innerHTML = '';

    habits.forEach(habit => {
        const row = document.createElement('tr');
        row.className = 'habit-row';

        const habitCell = document.createElement('td');
        habitCell.innerHTML = `
            <div class="habit-info" onclick="editHabit('${habit._id}')" style="cursor: pointer;">
                <span class="habit-name">${habit.name}</span>
                <span class="habit-meta">${habit.category} • ${habit.difficulty}</span>
            </div>
        `;
        row.appendChild(habitCell);

        const days = window.calendar.getDays();
        for (let i = 1; i <= days; i++) {
            const dateStr = window.calendar.formatDate(window.calendar.getYear(), window.calendar.getMonth(), i);
            const isCompleted = completions.some(c => c.habitId === habit._id && c.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            const td = document.createElement('td');
            td.style.textAlign = 'center';

            const cell = document.createElement('div');
            cell.className = `day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}`;
            cell.innerHTML = isCompleted ? '✓' : '';
            cell.onclick = (e) => toggleCompletion(habit._id, dateStr, cell, e);

            td.appendChild(cell);
            row.appendChild(td);
        }

        list.appendChild(row);
    });
}

async function toggleCompletion(habitId, date, cell, event) {
    try {
        const res = await window.api.post(`/habits/${habitId}/toggle`, { date });
        cell.classList.toggle('completed', res.completed);
        cell.innerHTML = res.completed ? '✓' : '';

        if (res.completed) {
            showXpAnimation(event.clientX, event.clientY);
        }
        
        // Update completions local state
        if (res.completed) {
            completions.push({ habitId, date });
        } else {
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
    const habitData = {
        name: document.getElementById('habit-name').value,
        category: document.getElementById('habit-category').value,
        difficulty: document.getElementById('habit-difficulty').value
    };

    try {
        if (id) {
            await window.api.put(`/habits/${id}`, habitData);
        } else {
            await window.api.post('/habits', habitData);
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
    
    document.getElementById('delete-habit-btn').style.display = 'block';
    document.getElementById('delete-habit-btn').onclick = () => deleteHabit(habit._id);
    
    window.toggleModal('habit-modal', true);
}

// Reset modal for "Add Habit"
const originalAddBtn = document.querySelector('button[onclick*="habit-modal"]');
if (originalAddBtn) {
    originalAddBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Habit';
        document.getElementById('habit-id').value = '';
        document.getElementById('habit-form').reset();
        document.getElementById('delete-habit-btn').style.display = 'none';
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

window.loadHabits = loadHabits;
