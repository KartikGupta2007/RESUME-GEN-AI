import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
    timeout: 10000,
})

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