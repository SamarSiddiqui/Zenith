import axios from "axios";

// Custom event emitter for session expiration
const sessionEventEmitter = {
    listeners: [] as Array<() => void>,
    emit: function () {
        this.listeners.forEach((listener) => listener());
    },
    on: function (listener: () => void) {
        this.listeners.push(listener);
    },
    off: function (listener: () => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    },
};

// Helper function to get a cookie by name
export const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const raw = parts.pop()?.split(";").shift() || null;
        if (!raw) return null;
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }
    return null;
};

// Create Axios instance
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api', // Adjusted to use NEXT_PUBLIC to be usable in client components
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Flag to prevent multiple session expiration events
let hasEmittedSessionExpired = false;

// Add a request interceptor to include the token from the cookie
apiClient.interceptors.request.use(
    (config) => {
        // Note: The auth cookie in the project is named 'access_token' per lib/api/auth/index.ts
        const token = getCookie("access_token") || getCookie("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle expired tokens
apiClient.interceptors.response.use(
    (response) => {
        // Reset the flag on a successful response
        hasEmittedSessionExpired = false;
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401 && !hasEmittedSessionExpired) {
            hasEmittedSessionExpired = true;
            sessionEventEmitter.emit();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
export { sessionEventEmitter };
