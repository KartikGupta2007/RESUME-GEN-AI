import { createContext, useState, useEffect } from "react";
import { AUTH_EXPIRED_EVENT, getCurrentUser } from "../services/auth.api.js";

export const AuthContext = createContext()
export const AuthProvider = ({ children }) => { 
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const data = await getCurrentUser()
                setUser(data?.data ?? null)
            } catch (err) {
                if (err?.response?.status !== 401) {
                    console.error(err)
                }
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        initAuth()
    }, [])

    useEffect(() => {
        const handleAuthExpired = () => {
            setUser(null)
            setLoading(false)
        }

        window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
        return () => {
            window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
        }
    }, [])

    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )
}