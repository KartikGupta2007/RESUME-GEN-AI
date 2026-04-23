import { useContext } from "react";
import { AuthContext } from "./auth.context.jsx";
import { register, login, logout, changeCurrentPassword, setGoogleAccountPassword, googleAuth } from "../services/auth.api.js";

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

    const handleGoogleAuth = async ({ credential }) => {
        setLoading(true)
        try {
            const data = await googleAuth({ credential })
            if (!data?.data?.user) {
                return {
                    success: false,
                    message: data?.message || "Google sign-in failed"
                }
            }
            setUser(data.data.user)
            return {
                success: true,
                message: data?.message || "Google sign-in successful"
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Unable to sign in with Google right now"
            return {
                success: false,
                message,
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
            // console.log(err)
            return false
        } finally {
            setLoading(false)
        }
    }
    
    const handleChangePassword = async ({ currentPassword, newPassword ,confirmNewPassword }) => {
        setLoading(true)
        try {
            const data = await changeCurrentPassword({ currentPassword, newPassword ,confirmNewPassword })
            setUser(null)
            return {
                success: true,
                message: data?.message || "Password changed successfully, please login again with new password",
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Unable to change password right now"
            return {
                success: false,
                message,
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSetGooglePassword = async ({ newPassword, confirmNewPassword }) => {
        setLoading(true)
        try {
            const data = await setGoogleAccountPassword({ newPassword, confirmNewPassword })
            if (data?.data?.user) {
                setUser(data.data.user)
            }
            return {
                success: true,
                message: data?.message || "Password set successfully"
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Unable to set password right now"
            return {
                success: false,
                message,
            }
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleGoogleAuth, handleLogout, handleChangePassword, handleSetGooglePassword }
}