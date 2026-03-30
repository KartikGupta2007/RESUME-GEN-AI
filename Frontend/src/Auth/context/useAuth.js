import { useContext, useEffect } from "react";
import { AuthContext } from "./auth.context.jsx";
import { register, login, logout, getCurrentUser, changeCurrentPassword } from "../services/auth.api.js";


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
                return false
            }
            setUser(data.data.user)
            return true
        } catch (err) {
            console.log(err)
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ userName, email, password, fullName }) => {
        setLoading(true)
        try {
            const data = await register({ userName, email, password, fullName })
            if (!data?.data) {
                return false
            }
            setUser(data.data)
            return true
        } catch (err) {
            console.log(err)
            return false
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

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getCurrentUser()
                setUser(data?.data ?? null)
            } catch (err) {
                console.log(err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getAndSetUser()
    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout, handleChangePassword }
}