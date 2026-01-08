import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('fairshot-auth');
        if (authData) {
            const { state } = JSON.parse(authData);
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
            }
        }
    }
    return config;
});

// Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth state and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('fairshot-auth');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
