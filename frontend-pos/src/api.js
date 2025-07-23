import axios from 'axios';

const baseURL =
    process.env.REACT_APP_API_URL ||
    (window && window.location && window.location.origin.includes('localhost:3000')
        ? 'http://localhost:5000'
        : '/'); // fallback

const api = axios.create({ baseURL });

// --- Menu APIs ---
export const getMenus = (q = '') =>
    api.get('/api/menu', q ? { params: { q } } : undefined);

export const createMenu = (data) => api.post('/api/menu', data);

export const updateMenu = (id, data) => api.put(`/api/menu/${id}`, data);

export const deleteMenu = (id) => api.delete(`/api/menu/${id}`);

export default api;
