import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const authApi = {
    /**
     * Set authentication cookies
     */
    setAuthCookies: (token: string, user: any) => {
        // Token expires in 3 days (matches backend JWT config)
        Cookies.set('access_token', token, { expires: 3, secure: process.env.NODE_ENV === 'production' });
        Cookies.set('user', JSON.stringify(user), { expires: 3, secure: process.env.NODE_ENV === 'production' });
    },

    /**
     * Clear authentication cookies (Logout)
     */
    clearAuthCookies: () => {
        Cookies.remove('access_token');
        Cookies.remove('user');
    },

    /**
     * Get current user from cookies
     */
    getUser: () => {
        const userStr = Cookies.get('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Performs a login request
     */
    login: async (credentials: { email: string; password: string }) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to login');
        }

        authApi.setAuthCookies(data.token, data.user);
        return data;
    },

    /**
     * Performs a signup request
     */
    signup: async (credentials: { email: string; password: string }) => {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create account');
        }

        authApi.setAuthCookies(data.token, data.user);
        return data;
    }
};
