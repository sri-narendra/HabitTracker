const API_BASE_URL = 'http://localhost:3000/api'; // Change to Render URL after deployment

const api = {
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.style.display = 'block';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            
            if (spinner) spinner.style.display = 'none';
            
            if (response.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                    window.location.href = 'index.html';
                }
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (spinner) spinner.style.display = 'none';
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) { return this.fetch(endpoint, { method: 'GET' }); },
    post(endpoint, body) { return this.fetch(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
    put(endpoint, body) { return this.fetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
    delete(endpoint) { return this.fetch(endpoint, { method: 'DELETE' }); }
};

window.api = api;
