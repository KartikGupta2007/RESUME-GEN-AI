import {useState, useEffect} from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../context/useAuth.js'
import "../styles/auth.style.scss"

const PASSWORD_RULES = [
    {
        id: "length",
        label: "At least 8 characters",
        isValid: (value) => value.length >= 8,
    },
    {
        id: "uppercase",
        label: "At least one uppercase letter",
        isValid: (value) => /[A-Z]/.test(value),
    },
    {
        id: "lowercase",
        label: "At least one lowercase letter",
        isValid: (value) => /[a-z]/.test(value),
    },
    {
        id: "number",
        label: "At least one number",
        isValid: (value) => /[0-9]/.test(value),
    },
    {
        id: "special",
        label: "At least one special character",
        isValid: (value) => /[^A-Za-z0-9]/.test(value),
    },
]

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ fullName, setFullName ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)
    const [ passwordTouched, setPasswordTouched ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState("")

    const {user, loading, handleRegister} = useAuth()
    const failedPasswordRules = PASSWORD_RULES.filter((rule) => !rule.isValid(password))
    const shouldShowPasswordRules = passwordTouched || password.length > 0
    
    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage("")
        setPasswordTouched(true)

        if (failedPasswordRules.length > 0) {
            setErrorMessage("Password does not satisfy all required rules.")
            return
        }

        const registerResult = await handleRegister({
            userName: username,
            email,
            password,
            fullName,
        })

        if (registerResult?.success) {
            navigate("/login")
            return
        }

        setErrorMessage(registerResult?.message || "Registration failed")
    }

    if(loading){
        return (<main><h1>Loading.......</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register Now</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            onChange={(e) => { setFullName(e.target.value) }}
                            type="text" id="fullName" name='fullName' placeholder='Enter full name' />
                    </div>

                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-field">
                            <input
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setPasswordTouched(true)
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

                        {shouldShowPasswordRules && (
                            <ul className="password-rules">
                                {PASSWORD_RULES.map((rule) => {
                                    const valid = rule.isValid(password)
                                    return (
                                        <li key={rule.id} className={valid ? "valid" : "invalid"}>
                                            {valid ? "[OK]" : "[X]"} {rule.label}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                    
                    {errorMessage && <p className="form-error">{errorMessage}</p>}

                    <button className='button primary-button' >Register</button>

                </form>

                <p>Already have an account? <Link to={"/login"} >Login</Link> </p>
            </div>
        </main>
    )
}

export default Register