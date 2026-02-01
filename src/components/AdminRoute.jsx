import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
    const { user, loading, signOut } = useAuth();

    if (loading) {
        return <div className="h-screen bg-neutral-900 flex items-center justify-center text-white font-titan animate-pulse">Scanning Bio-metrics...</div>;
    }

    // Admin Access Control
    // Replace with your actual email(s)
    const ADMIN_EMAILS = ['nnvnxx.10@gmail.com', 'admin@sparklebooth.com'];

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
        return <div className="h-screen bg-[#02124d] flex flex-col items-center justify-center text-white p-8">
            <h1 className="font-titan text-3xl mb-4 text-red-500">ACCESS DENIED</h1>
            <p className="mb-8 text-center max-w-md">You do not have clearance for this terminal. Please sign in with an administrator account ({user.email}).</p>
            <button
                onClick={async () => {
                    await signOut();
                    window.location.href = '/login';
                }}
                className="bg-game-accent text-black px-6 py-3 rounded-xl font-bold hover:brightness-110"
            >
                SWITCH ACCOUNT
            </button>
        </div>;
    }

    return children;
};

export default AdminRoute;
