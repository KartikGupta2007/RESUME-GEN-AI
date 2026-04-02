import {useState, useEffect} from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../context/useAuth.js'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ fullName, setFullName ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)

    const {user, loading, handleRegister} = useAuth()
    
    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const isRegistered = await handleRegister({
            userName: username,
            email,
            password,
            fullName,
        })
        if (isRegistered) {
            navigate("/login")
        }
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
                                onChange={(e) => { setPassword(e.target.value) }}
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
                    

                    <button className='button primary-button' >Register</button>

                </form>

                <p>Already have an account? <Link to={"/login"} >Login</Link> </p>
            </div>
        </main>
    )
}

export default Register