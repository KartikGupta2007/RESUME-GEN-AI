import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router";
import Loading from "./Loading.jsx";

const Protected = ({children}) => {
    const { loading,user } = useAuth()
    if(loading){
        return (
            <Loading text="Authenticating..." />
        )
    }
    if(!user){
        return <Navigate to={'/login'} />
    }
    return children
}

export default Protected