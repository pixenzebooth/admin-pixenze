import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    if (user) {
        // Already logged in, redirect to dashboard
        // Use a useEffect or render Navigate to avoid bad setState during render if strict mode, but Navigate component is safe
        return <Navigate to="/" replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('Magic link sent! Check your email.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#02124d] flex items-center justify-center font-nunito p-4">
            <div className="bg-white/10 border-4 border-black p-8 rounded-2xl shadow-game max-w-md w-full relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
                    <Sparkles size={150} />
                </div>

                <h1 className="text-3xl font-titan text-game-accent mb-2 text-center">ADMIN PORTAL</h1>
                <p className="text-gray-300 text-center mb-8 text-sm">Restricted Access. Credentials Required.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">EMAIL COMMANDER</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-game-secondary focus:outline-none transition"
                            placeholder="admin@pixenzebooth.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-game-success text-black font-titan py-3 rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 hover:brightness-110 transition flex justify-center items-center gap-2"
                    >
                        {loading ? 'TRANSMITTING...' : 'SEND MAGIC LINK'}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 p-3 bg-white/20 rounded-lg text-center text-sm font-bold border border-white/10 animate-pulse">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
