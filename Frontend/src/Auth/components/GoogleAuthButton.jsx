import { useEffect, useRef, useState } from "react"
import { useAuth } from "../context/useAuth.js"

const GOOGLE_SCRIPT_ID = "google-identity-services-script"

const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject(new Error("Google auth is only available in the browser"))
            return
        }

        if (window.google?.accounts?.id) {
            resolve()
            return
        }

        const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)
        if (existingScript) {
            existingScript.addEventListener("load", resolve, { once: true })
            existingScript.addEventListener("error", reject, { once: true })
            return
        }

        const script = document.createElement("script")
        script.id = GOOGLE_SCRIPT_ID
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Unable to load Google sign-in"))
        document.head.appendChild(script)
    })
}

const GoogleAuthButton = ({ onSuccess, onError }) => {
    const { handleGoogleAuth } = useAuth()
    const buttonRef = useRef(null)
    const handleGoogleAuthRef = useRef(handleGoogleAuth)
    const [statusMessage, setStatusMessage] = useState("")
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    useEffect(() => {
        handleGoogleAuthRef.current = handleGoogleAuth
    }, [handleGoogleAuth])

    useEffect(() => {
        let isMounted = true

        const initializeGoogleButton = async () => {
            if (!clientId) {
                setStatusMessage("Google sign-in is not configured for this environment.")
                return
            }

            try {
                await loadGoogleScript()
                if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
                    return
                }

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async ({ credential }) => {
                        if (!credential) {
                            const message = "Google sign-in did not return a credential"
                            setStatusMessage(message)
                            onError?.(message)
                            return
                        }

                        const result = await handleGoogleAuthRef.current({ credential })
                        if (result?.success) {
                            setStatusMessage("")
                            onSuccess?.(result)
                            return
                        }

                        const message = result?.message || "Unable to sign in with Google"
                        setStatusMessage(message)
                        onError?.(message)
                    },
                })

                buttonRef.current.innerHTML = ""
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    width: 320,
                    text: "continue_with",
                })
            } catch (error) {
                const message = error?.message || "Unable to load Google sign-in"
                setStatusMessage(message)
                onError?.(message)
            }
        }

        initializeGoogleButton()

        return () => {
            isMounted = false
            if (buttonRef.current) {
                buttonRef.current.innerHTML = ""
            }
        }
    }, [clientId, onError, onSuccess])

    if (!clientId) {
        return <p className="google-auth-status">Set VITE_GOOGLE_CLIENT_ID to enable Google auth.</p>
    }

    return (
        <div className="google-auth-wrapper">
            <div ref={buttonRef} className="google-auth-btn" />
            {statusMessage && <p className="google-auth-status">{statusMessage}</p>}
        </div>
    )
}

export default GoogleAuthButton
