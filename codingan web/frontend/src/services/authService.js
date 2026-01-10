/**
 * Auth Service
 * API calls for authentication
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Login user
 */
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login gagal');
    }

    const data = await response.json();

    // Store token in localStorage
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
};

/**
 * Register user
 */
export const registerUser = async (name, email, password, role) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registrasi gagal');
    }

    const data = await response.json();

    // Store token in localStorage
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
};

/**
 * Logout user
 */
export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

/**
 * Get auth token
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

/**
 * Fetch with auth header
 */
export const authFetch = async (url, options = {}) => {
    const token = getToken();

    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    });
};
