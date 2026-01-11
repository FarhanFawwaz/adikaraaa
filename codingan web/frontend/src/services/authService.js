/**
 * Auth Service
 * API calls for authentication using httpOnly cookies
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Store user in memory (not localStorage for security)
let currentUser = null;

/**
 * Login user
 */
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: send/receive cookies
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login gagal');
    }

    const data = await response.json();

    // Store user in memory and localStorage (for UI only, not auth)
    currentUser = data.user;
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
        credentials: 'include', // Important: send/receive cookies
        body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registrasi gagal');
    }

    const data = await response.json();

    // Store user in memory and localStorage (for UI only, not auth)
    currentUser = data.user;
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
};

/**
 * Logout user
 */
export const logoutUser = async () => {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include', // Important: send cookies to delete
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local state
    currentUser = null;
    localStorage.removeItem('user');
};

/**
 * Get current user from memory/localStorage
 * For UI display purposes
 */
export const getCurrentUser = () => {
    if (currentUser) {
        return currentUser;
    }

    // Fallback to localStorage for page refresh
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        return currentUser;
    }

    return null;
};

/**
 * Check authentication status with backend
 * Verifies the httpOnly cookie is valid
 */
export const checkAuth = async () => {
    try {
        const response = await fetch(`${API_URL}/api/auth/check`, {
            method: 'GET',
            credentials: 'include', // Important: send cookies
        });

        if (!response.ok) {
            currentUser = null;
            localStorage.removeItem('user');
            return { authenticated: false, user: null };
        }

        const data = await response.json();

        if (data.authenticated && data.user) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            currentUser = null;
            localStorage.removeItem('user');
        }

        return data;
    } catch (error) {
        console.error('Auth check error:', error);
        currentUser = null;
        localStorage.removeItem('user');
        return { authenticated: false, user: null };
    }
};

/**
 * Check if user is authenticated (quick check from memory)
 */
export const isAuthenticated = () => {
    return !!getCurrentUser();
};

/**
 * Fetch with credentials (for authenticated API calls)
 */
export const authFetch = async (url, options = {}) => {
    return fetch(`${API_URL}${url}`, {
        ...options,
        credentials: 'include', // Important: send cookies
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        },
    });
};

/**
 * Get current user info from backend
 */
export const fetchCurrentUser = async () => {
    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    } catch (error) {
        console.error('Fetch user error:', error);
        return null;
    }
};
