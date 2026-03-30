import { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/auth.api.js";

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
                console.log(err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        initAuth()
    }, [])

    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}} >
            {children}
        </AuthContext.Provider>
    )
}