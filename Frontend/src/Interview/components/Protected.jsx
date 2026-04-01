import { useInterview } from "../hooks/useInterview.js";
import { Navigate } from "react-router";
import Loading from "./Loading.jsx";

const Protected = ({children}) => {
    const { loading,user } = useInterview()
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