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
                <div className="auth-divider">
                    <span>or</span>
                </div>
                <button type="button" className="button google-auth-btn">
                    <span className="google-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img" aria-label="Google logo">
                            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.6 2.8-4 2.8-6.9 0-.7-.1-1.5-.2-2.2H12z" />
                            <path fill="#34A853" d="M12 22c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.4-4.1H3.3v2.5C4.9 19.7 8.2 22 12 22z" />
                            <path fill="#FBBC05" d="M6.6 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.6H3.3C2.5 9.1 2 10.5 2 12s.5 2.9 1.3 4.4l3.3-2.5z" />
                            <path fill="#4285F4" d="M12 6.3c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.8 3.5 14.6 2.6 12 2.6c-3.8 0-7.1 2.3-8.7 5.6l3.3 2.5c.7-2.4 2.9-4.1 5.4-4.1z" />
                        </svg>
                    </span>
                    <span>Sign in with Google</span>
                </button>
                <p>Don't have an account? <Link to={"/register"} >Register</Link> </p>
            </div>
        </main>
    )
}

export default Login