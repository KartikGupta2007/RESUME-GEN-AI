import React from 'react'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client'
import Login from './Auth/pages/Login.jsx'
import Register from './Auth/pages/Register.jsx'
import Protected from './Auth/components/Protected.jsx'
import { AuthProvider } from './Auth/context/auth.context.jsx'
import './style.scss'

const Home = () => (
    <main>
        <h1>Welcome</h1>
    </main>
)

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
])

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
)