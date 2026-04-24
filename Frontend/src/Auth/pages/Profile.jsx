import { useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { useNavigate } from 'react-router'
import '../styles/auth.style.scss'
import PasswordField from '../components/PasswordField.jsx'
import PasswordRules from '../components/PasswordRules.jsx'
import { PASSWORD_RULES } from '../components/PasswordRules.jsx'



const Profile = () => {
    const { user, handleLogout, handleChangePassword, handleSetGooglePassword } = useAuth()
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [message, setMessage] = useState('')
    const [passwordSetupMessage, setPasswordSetupMessage] = useState('')
    const [googleNewPassword, setGoogleNewPassword] = useState('')
    const [googleConfirmNewPassword, setGoogleConfirmNewPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
    const [showGoogleNewPassword, setShowGoogleNewPassword] = useState(false)
    const [showGoogleConfirmNewPassword, setShowGoogleConfirmNewPassword] = useState(false)
    const [newPasswordTouched, setNewPasswordTouched] = useState(false)
    const [googleNewPasswordTouched, setGoogleNewPasswordTouched] = useState(false)

    const isGoogleOnlyAccount = user?.authProvider === 'google' && !user?.hasPassword
    const accountTypeLabel = user?.authProvider === 'google' && user?.hasPassword ? 'Local' : (user?.authProvider === 'google' ? 'Google' : 'Local')
    const localFailedPasswordRules = PASSWORD_RULES.filter((rule) => !rule.isValid(newPassword))
    const googleFailedPasswordRules = PASSWORD_RULES.filter((rule) => !rule.isValid(googleNewPassword))
    const shouldShowLocalPasswordRules = newPasswordTouched || newPassword.length > 0
    const shouldShowGooglePasswordRules = googleNewPasswordTouched || googleNewPassword.length > 0
    const localAdditionalRules = [
        {
            id: 'different-from-confirm',
            label: 'Confirm Password should be same as New Password',
            isValid: () => confirmNewPassword.trim() && newPassword.trim() && newPassword === confirmNewPassword,
        },
    ]
    const googleAdditionalRules = [
        {
            id: 'different-from-confirm',
            label: 'Confirm Password should be same as New Password',
            isValid: () => googleConfirmNewPassword.trim() && googleNewPassword.trim() && googleNewPassword === googleConfirmNewPassword,
        },
    ]

    const isLocalSubmitDisabled =
        !currentPassword.trim() ||
        !newPassword.trim() ||
        !confirmNewPassword.trim() ||
        localFailedPasswordRules.length > 0 ||
        newPassword !== confirmNewPassword ||
        currentPassword === newPassword

    const isGoogleSubmitDisabled =
        !googleNewPassword.trim() ||
        !googleConfirmNewPassword.trim() ||
        googleFailedPasswordRules.length > 0 ||
        googleNewPassword !== googleConfirmNewPassword

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    const onChangePassword = async (e) => {
        e.preventDefault()
        setMessage('')
        setNewPasswordTouched(true)
        if(newPassword !== confirmNewPassword) {
            setMessage("Confirm password must match the new password.")
            return
        }
        if(currentPassword === newPassword) {
            setMessage("New password must be different from current password.")
            return
        }
        // check weather the current current password is correct and then change to new password, if successful log the user out so that they can login again with new password, if failed show error message
        
        const result = await handleChangePassword({ currentPassword, newPassword, confirmNewPassword })
        // console.log(result)
        if(result?.success) {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            navigate('/login')
        } else {
            setMessage(result?.message || "Failed to change password")
        }
    }

    const onSetGooglePassword = async (e) => {
        e.preventDefault()
        setPasswordSetupMessage('')
        setGoogleNewPasswordTouched(true)

        if (googleNewPassword !== googleConfirmNewPassword) {
            setPasswordSetupMessage("Confirm password must match the new password.")
            return
        }

        const result = await handleSetGooglePassword({
            newPassword: googleNewPassword,
            confirmNewPassword: googleConfirmNewPassword,
        })

        if (result?.success) {
            setPasswordSetupMessage(result.message || 'Password set successfully')
            setGoogleNewPassword('')
            setGoogleConfirmNewPassword('')
        } else {
            setPasswordSetupMessage(result?.message || 'Failed to set password')
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
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Type</label>
                            <p style={{ margin: '0.3rem 0', fontSize: '1.1rem' }}>{accountTypeLabel}</p>
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

                    {isGoogleOnlyAccount ? (
                        <>
                            <p style={{ color: '#aaa', fontSize: '1rem', marginTop: '1rem' }}>
                                Set a password here, and then you can log in locally with email and password.
                            </p>
                            {passwordSetupMessage && (
                                <p style={{ color: '#ff2d78', fontSize: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255, 45, 120, 0.1)', borderRadius: '0.5rem' }}>
                                    {passwordSetupMessage}
                                </p>
                            )}

                            <form onSubmit={onSetGooglePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                                <PasswordField
                                    label="New Password"
                                    value={googleNewPassword}
                                    onChange={(e) => {
                                        setGoogleNewPassword(e.target.value)
                                        setGoogleNewPasswordTouched(true)
                                        if (passwordSetupMessage) setPasswordSetupMessage('')
                                    }}
                                    show={showGoogleNewPassword}
                                    onToggle={() => setShowGoogleNewPassword((prev) => !prev)}
                                />

                                <PasswordRules value={googleNewPassword} shouldShow={shouldShowGooglePasswordRules} additionalRules={googleAdditionalRules} />

                                <PasswordField
                                    label="Confirm Password"
                                    value={googleConfirmNewPassword}
                                    onChange={(e) => {
                                        setGoogleConfirmNewPassword(e.target.value)
                                        if (passwordSetupMessage) setPasswordSetupMessage('')
                                    }}
                                    show={showGoogleConfirmNewPassword}
                                    onToggle={() => setShowGoogleConfirmNewPassword((prev) => !prev)}
                                />
                                <button type="submit" disabled={isGoogleSubmitDisabled} style={{ marginTop: '1rem', alignSelf: 'flex-start', padding: '1rem 2rem', backgroundColor: '#ff2d78', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: isGoogleSubmitDisabled ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s', opacity: isGoogleSubmitDisabled ? 0.55 : 1 }}>
                                    Set Password
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#ccc', fontSize: '1.1rem' }}>Change Password</h4>
                            {message && (
                                <p style={{ color: '#ff2d78', fontSize: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255, 45, 120, 0.1)', borderRadius: '0.5rem' }}>
                                    {message}
                                </p>
                            )}

                            <form onSubmit={onChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <PasswordField
                                    label="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => {
                                        setCurrentPassword(e.target.value)
                                        if (message) setMessage('')
                                    }}
                                    show={showCurrentPassword}
                                    onToggle={() => setShowCurrentPassword((prev) => !prev)}
                                />
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <PasswordField
                                            label="New Password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value)
                                                setNewPasswordTouched(true)
                                                if (message) setMessage('')
                                            }}
                                            show={showNewPassword}
                                            onToggle={() => setShowNewPassword((prev) => !prev)}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <PasswordField
                                            label="Confirm Password"
                                            value={confirmNewPassword}
                                            onChange={(e) => {
                                                setConfirmNewPassword(e.target.value)
                                                if (message) setMessage('')
                                            }}
                                            show={showConfirmNewPassword}
                                            onToggle={() => setShowConfirmNewPassword((prev) => !prev)}
                                        />
                                    </div>
                                </div>
                                <PasswordRules value={newPassword} shouldShow={shouldShowLocalPasswordRules} additionalRules={localAdditionalRules} />
                                <button type="submit" disabled={isLocalSubmitDisabled} style={{ marginTop: '1rem', alignSelf: 'flex-start', padding: '1rem 2rem', backgroundColor: '#ff2d78', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: isLocalSubmitDisabled ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s', opacity: isLocalSubmitDisabled ? 0.55 : 1 }}>
                                    Update Password
                                </button>
                            </form>
                        </>
                    )}
                </div>

            </div>
        </main>
    )
}

export default Profile