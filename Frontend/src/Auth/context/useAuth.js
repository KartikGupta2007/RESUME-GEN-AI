import { useContext } from "react";
import { AuthContext } from "./auth.context.jsx";
import { register, login, logout, changeCurrentPassword } from "../services/auth.api.js";

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (!data?.data?.user) {
                return {
                    success: false,
                    message: data?.message || "Login failed"
                }
            }
            setUser(data.data.user)
            return {
                success: true,
                message: "Login successful"
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Unable to login right now"
            return {
                success: false,
                message
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ userName, email, password, fullName }) => {
        setLoading(true)
        try {
            const data = await register({ userName, email, password, fullName })
            if (!data?.data) {
                return {
                    success: false,
                    message: data?.message || "Registration failed"
                }
            }
            setUser(data.data)
            return {
                success: true,
                message: "Registration successful"
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Unable to register right now"
            return {
                success: false,
                message
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return true
        } catch (err) {
            console.log(err)
            return false
        } finally {
            setLoading(false)
        }
    }
    
    const handleChangePassword = async ({ currentPassword, newPassword ,confirmNewPassword }) => {
        setLoading(true)
        try {
            await changeCurrentPassword({ currentPassword, newPassword ,confirmNewPassword })
            handleLogout() // after changing password, user has to login again with new password, so setting user to null
            return true
        } catch (err) {
            console.log(err)
            return false
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout, handleChangePassword }
}