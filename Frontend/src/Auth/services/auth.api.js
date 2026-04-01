import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "")
let refreshRequest = null

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000, // increased timeout for production API calls
})

// Response interceptor to handle token refresh // for scenarios when access token expires and refresh token is still valid
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config || {};
        const requestUrl = originalRequest.url || "";
        // If error is 401 and not a retry yet (or avoiding infinite loop)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent from intercepting requests to auth endpoints
            if (
                requestUrl.includes('/api/v1/users/refresh-token') ||
                requestUrl.includes('/api/v1/users/login') ||
                requestUrl.includes('/api/v1/users/register')
            ) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                // Reuse one refresh request for concurrent 401s.
                if (!refreshRequest) {
                    refreshRequest = axios.post(
                        `${API_BASE_URL}/api/v1/users/refresh-token`,
                        {},
                        { withCredentials: true }
                    ).finally(() => {
                        refreshRequest = null;
                    });
                }

                await refreshRequest;
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Let route guards/context handle unauthenticated state without forced reload loops.
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;

export async function register({ userName, email, password, fullName }) {
    const response = await api.post('/api/v1/users/register', {
        email, password, userName, fullName
    })
    console.log(response.data)
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/v1/users/login", {
        email, password
    })
    return response.data
}

export async function logout() {
    const response = await api.post("/api/v1/users/logout")
    return response.data
}

export async function getCurrentUser() {
    const response = await api.get("/api/v1/users/me")
    return response.data
}

export async function changeCurrentPassword({ currentPassword, newPassword ,confirmNewPassword }) {
    const response = await api.post("/api/v1/users/change-password", {
        currentPassword, newPassword ,confirmNewPassword
    })
    return response.data
}