import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    timeout: 10000,
})

// Response interceptor to handle token refresh // for scenarios when access token expires and refresh token is still valid
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        // If error is 401 and not a retry yet (or avoiding infinite loop)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent from intercepting requests to the refresh-token or login endpoints
            if (originalRequest.url === '/api/v1/users/refresh-token' || originalRequest.url === '/api/v1/users/login') {
                return Promise.reject(error);
            }
            originalRequest._retry = true;
            try {
                // Manually hit the refresh endpoint
                await axios.post(
                    "http://localhost:3000/api/v1/users/refresh-token",
                    {},
                    { withCredentials: true }
                );
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh token also fails, we can't do much, user might need to login again
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