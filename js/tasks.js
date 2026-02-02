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
        list.innerHTML = '<p class="text-secondary" style="text-align: center;">No tasks found.</p>';
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item glass ${task.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}', this.checked)">
            <span class="task-title">${task.title}</span>
            <div class="task-actions">
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="editTask('${task._id}')">Edit</button>
                <button class="btn" style="padding: 0.25rem 0.5rem; background: rgba(255, 255, 255, 0.1); color: #ffffff;" onclick="deleteTask('${task._id}')">Delete</button>
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
        btn.classList.toggle('active', btn.textContent.toLowerCase() === filter);
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
