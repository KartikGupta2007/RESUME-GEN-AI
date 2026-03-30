import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function register({ userName, email, password, fullName }) {
    try {
        const response = await api.post('/api/v1/users/register', {
            email, password, userName, fullName
        })
        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/v1/users/login", {
            email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
    }
}

export async function logout() {
    try {
        const response = await api.post("/api/v1/users/logout")
        return response.data
    } catch (err) {
        console.log(err)
    }
}

export async function getCurrentUser() {
    try {
        const response = await api.get("/api/v1/users/me")
        return response.data
    } catch (err) {
        console.log(err)
    }
}

export async function changeCurrentPassword({ currentPassword, newPassword ,confirmNewPassword }) {
    try {
        const response = await api.post("/api/v1/users/change-password", {
            currentPassword, newPassword ,confirmNewPassword
        })
        return response.data
    } catch (err) {
        console.log(err)
    }
}