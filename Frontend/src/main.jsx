import React from 'react'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client'
import Login from './Auth/pages/Login.jsx'
import Register from './Auth/pages/Register.jsx'
import Protected from './Auth/components/Protected.jsx'
import Profile from './Auth/pages/Profile.jsx'
import { AuthProvider } from './Auth/context/auth.context.jsx'
import { InterviewProvider } from './Interview/context/interview.context.jsx'
import './style.scss'
import Home from './Interview/pages/Home.jsx'
import Interview from './Interview/pages/Interview.jsx' 

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
    {
        path: "/profile",
        element: <Protected><Profile /></Protected>
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
])

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <InterviewProvider>
                <RouterProvider router={router} />
            </InterviewProvider>
        </AuthProvider>
    </React.StrictMode>
)