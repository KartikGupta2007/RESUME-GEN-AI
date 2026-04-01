import { createContext,useState } from "react";
import { getCurrentUser } from "../../Auth/services/auth.api.js";
import { useEffect } from "react";

export const InterviewContext = createContext()
export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [user, setUser] = useState(null)
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
        <InterviewContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports, user, setUser }}>
            {children}
        </InterviewContext.Provider>
    )
}