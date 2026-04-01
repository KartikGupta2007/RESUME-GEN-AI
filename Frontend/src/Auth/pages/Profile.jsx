import { useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { useNavigate } from 'react-router'
import '../styles/auth.style.scss'

const Profile = () => {
    const { user, handleLogout, handleChangePassword } = useAuth()
    const navigate = useNavigate()
    
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [message, setMessage] = useState('')

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    const onChangePassword = async (e) => {
        e.preventDefault()
        if(newPassword !== confirmNewPassword) {
            setMessage("Passwords do not match")
            return
        }
        const success = await handleChangePassword({ currentPassword, newPassword, confirmNewPassword })
        if(success) {
            navigate('/login')
        } else {
            setMessage("Failed to change password")
        }
    }

    return (
        <main style={{ position: 'relative', backgroundColor: '#121212', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Navigation */}
            <nav style={{display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', width: '100%', boxSizing: 'border-box', position: 'absolute', top: 0, right: 0}}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{padding: '0.6rem 1.2rem', borderRadius: '0.5rem', background: '#ff2d78', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                >
                    Back To Home
                </button>
            </nav>

            <div style={{ padding: '4rem 4rem 1rem 4rem' }}>
                <h2 style={{ fontSize: '2.5rem', margin: 0, textAlign: 'center' }}>My Profile</h2>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', flex: 1, padding: '3rem 4rem', gap: '3rem', alignItems: 'flex-start', overflow: 'hidden' }}>
                
                {/* Left Column: User Info */}
                <div style={{ flex: 1, backgroundColor: '#1E1E1E', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #333' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ff2d78', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                            {user?.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{user?.fullName}</h3>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#aaa', fontSize: '1rem' }}>@{user?.userName}</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                            <p style={{ margin: '0.3rem 0', fontSize: '1.1rem' }}>{user?.email}</p>
                        </div>
                    </div>

                    <div style={{ flexGrow: 1 }}></div>

                    <button 
                        onClick={onLogout} 
                        style={{ marginTop: '2rem', backgroundColor: 'transparent', width: '100%', padding: '1rem', color: '#ff2d78', border: '2px solid #ff2d78', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.2s' }}>
                        Logout
                    </button>
                </div>

                {/* Right Column: Security */}
                <div style={{ flex: 1.5, backgroundColor: '#1E1E1E', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxHeight: '100%' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #333' }}>Security Settings</h3>
                    
                    <h4 style={{ margin: '0 0 1rem 0', color: '#ccc', fontSize: '1.1rem' }}>Change Password</h4>
                    {message && <p style={{ color: '#ff2d78', fontSize: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255, 45, 120, 0.1)', borderRadius: '0.5rem' }}>{message}</p>}
                    
                    <form onSubmit={onChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ color: '#aaa', fontSize: '0.95rem' }}>Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff', outline: 'none', fontSize: '1rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <label style={{ color: '#aaa', fontSize: '0.95rem' }}>New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff', outline: 'none', fontSize: '1rem' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <label style={{ color: '#aaa', fontSize: '0.95rem' }}>Confirm Password</label>
                                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid #333', backgroundColor: '#2a2a2a', color: '#fff', outline: 'none', fontSize: '1rem' }} />
                            </div>
                        </div>
                        <button type="submit" style={{ marginTop: '1rem', alignSelf: 'flex-start', padding: '1rem 2rem', backgroundColor: '#ff2d78', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s' }}>
                            Update Password
                        </button>
                    </form>
                </div>

            </div>
        </main>
    )
}

export default Profile