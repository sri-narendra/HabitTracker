document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

let tasks = [];
let currentFilter = 'all';

async function loadTasks() {
    try {
        tasks = await window.api.get('/tasks');
        renderTasks();
    } catch (err) {
        console.error('Failed to load tasks:', err);
    }
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = '';

    const filtered = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-accent-grey font-medium text-center py-8">No tasks found.</p>';
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement('div');
        item.className = `flex items-center gap-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-4 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02] ${task.completed ? 'opacity-50' : ''}`;
        
        item.innerHTML = `
            <input type="checkbox" class="w-5 h-5 rounded border-slate-300 dark:border-border-dark text-primary focus:ring-primary bg-slate-100 dark:bg-black cursor-pointer" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}', this.checked)">
            <span class="flex-1 font-medium ${task.completed ? 'line-through text-slate-500 dark:text-accent-grey' : 'text-slate-900 dark:text-white'}">${task.title}</span>
            <div class="flex gap-2">
                <button class="px-3 py-1 text-xs font-bold uppercase text-slate-500 dark:text-accent-grey hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-border-dark rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onclick="editTask('${task._id}')">Edit</button>
                <button class="px-3 py-1 text-xs font-bold uppercase text-red-500 hover:text-red-400 border border-transparent hover:bg-red-500/10 rounded-lg transition-colors" onclick="deleteTask('${task._id}')">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

async function toggleTask(id, completed) {
    try {
        await window.api.put(`/tasks/${id}`, { completed });
        const task = tasks.find(t => t._id === id);
        if (task) task.completed = completed;
        renderTasks();
    } catch (err) {
        alert(err.message);
    }
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;

    try {
        if (id) {
            await window.api.put(`/tasks/${id}`, { title });
        } else {
            await window.api.post('/tasks', { title });
        }
        window.toggleModal('task-modal', false);
        loadTasks();
        e.target.reset();
    } catch (err) {
        alert(err.message);
    }
});

function editTask(id) {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task._id;
    document.getElementById('task-title').value = task.title;
    window.toggleModal('task-modal', true);
}

async function deleteTask(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await window.api.delete(`/tasks/${id}`);
        loadTasks();
    } catch (err) {
        alert(err.message);
    }
}
