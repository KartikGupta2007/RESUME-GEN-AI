import {useState, useEffect} from 'react'
import { useNavigate, Link } from 'react-router'
import "../styles/auth.style.scss"
import { useAuth } from '../context/useAuth.js'
import Loading from '../components/Loading.jsx'

const Login = () => {
    const { user, loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState("")

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage("")
        const loginResult = await handleLogin({ email, password })
        if (loginResult?.success) {
            navigate('/')
            return
        }

        setErrorMessage(loginResult?.message || "Invalid credentials")
    }

    if(loading){
        return (
            <Loading text="Logging in..." />
        )
    }


    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errorMessage) setErrorMessage("")
                            }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errorMessage) setErrorMessage("")
                                }}
                                type={showPassword ? "text" : "password"} id="password" name='password' placeholder='Enter password' />
                            <button
                                type="button"
                                className="show-password-btn"
                                onClick={() => { setShowPassword((prev) => !prev) }}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>
                    {errorMessage && <p className="form-error">{errorMessage}</p>}
                    <button className='button primary-button' >Login</button>
                </form>
                <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
            </div>
        </main>
    )
}

export default Login