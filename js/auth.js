function switchTab(type) {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase().replace(' ', '') === type);
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${type}-form`);
    });
    document.getElementById('auth-error').textContent = '';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('auth-error');

    try {
        const data = await window.api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'habits.html';
    } catch (err) {
        errorEl.textContent = err.message;
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errorEl = document.getElementById('auth-error');

    if (password !== confirm) {
        errorEl.textContent = "Passwords don't match";
        return;
    }

    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const data = await window.api.post('/auth/signup', { username, email, password, timezone });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'habits.html';
    } catch (err) {
        errorEl.textContent = err.message;
    }
});
