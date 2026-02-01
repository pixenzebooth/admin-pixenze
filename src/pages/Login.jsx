import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { user, signInWithGoogle } = useAuth();
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
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });
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

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#02124d] px-2 text-gray-400 font-bold">Or enter via</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={signInWithGoogle}
                        className="w-full bg-white text-black font-titan py-3 rounded-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 hover:brightness-110 transition flex justify-center items-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        GOOGLE ACCESS
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
