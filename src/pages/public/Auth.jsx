import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Activity, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoginPass, setShowLoginPass] = useState(false);
    const [showRegPass, setShowRegPass] = useState(false);

    // Password strength calculator
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { level: 2, label: 'Normal', color: 'bg-amber-500' };
        return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
    };
    const passwordStrength = getPasswordStrength(regPassword);

    useEffect(() => {
        setIsLogin(location.pathname !== '/register');
        setError('');
    }, [location.pathname]);

    useEffect(() => {
        if (user) {
            if (user.role === 'doctor') navigate('/doctor/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/patient/dashboard');
        }
    }, [user, navigate]);

    const toggleAuth = () => {
        setError('');
        if (isLogin) navigate('/register');
        else navigate('/login');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await loginUser({ email: loginEmail, password: loginPassword });
            login(data.token, data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!agreed) { setError('Please agree to the Terms of Service'); return; }
        setError('');
        setLoading(true);
        try {
            const { data } = await registerUser({ name: regName, email: regEmail, password: regPassword });
            login(data.token, data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a1a15] flex items-center justify-center p-4 relative overflow-hidden font-display">
            {/* Ambient Background - Animated Blobs */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -45, 0],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-700/20 rounded-full blur-[150px]"
                />
            </div>

            {/* Main 3D Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-5xl h-[650px] z-10 perspective-2000"
            >
                {/* The Master Card */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex overflow-hidden">

                    {/* Left Side - Login Form Context */}
                    <motion.div
                        animate={{
                            opacity: isLogin ? 1 : 0,
                            scale: isLogin ? 1 : 0.95,
                            x: isLogin ? 0 : -20
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-1/2 p-12 flex flex-col justify-center ${!isLogin ? 'pointer-events-none' : ''}`}
                    >
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-emerald-400 font-bold mb-8 italic">Ready to continue your health journey?</p>

                        {error && isLogin && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                <p className="text-red-300 text-sm font-bold">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type={showLoginPass ? 'text' : 'password'}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors">
                                        {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <Link to="/forgot-password" size={20} className="text-xs font-black text-emerald-500/70 hover:text-emerald-400 uppercase tracking-tighter">Forgot Password?</Link>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </form>

                        <div className="mt-10">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink mx-4 text-xs font-black text-white/30 uppercase tracking-widest">Or continue with</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-white/70 group-hover:text-white font-bold text-sm transition-colors">Sign in with Google</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Side - Register Form Context */}
                    <motion.div
                        animate={{
                            opacity: !isLogin ? 1 : 0,
                            scale: !isLogin ? 1 : 0.95,
                            x: !isLogin ? 0 : 20
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-1/2 p-12 flex flex-col justify-center ${isLogin ? 'pointer-events-none' : ''}`}
                    >
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Create Account</h2>
                        <p className="text-emerald-400 font-bold mb-8 italic">Join the future of personalized care.</p>

                        {error && !isLogin && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
                                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                                <p className="text-red-300 text-sm font-bold">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                                        <input
                                            type="text"
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            placeholder="John Doe"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                                        <input
                                            type="email"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            placeholder="j@example.com"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Choose Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                                    <input
                                        type={showRegPass ? 'text' : 'password'}
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-white font-bold text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                                    />
                                    <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors">
                                        {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {regPassword && (
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <div className="flex gap-1.5 flex-1">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-white/10'}`} />
                                            ))}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength.level === 1 ? 'text-red-400' : passwordStrength.level === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 p-1">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded border-white/10 bg-white/5 accent-emerald-500" />
                                <span className="text-xs font-bold text-white/40">I agree to the <Link to="/legal" className="text-emerald-500 underline">Terms of Service</Link></span>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-2 group mt-2 disabled:opacity-50">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Start Your Journey</span><ArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink mx-4 text-xs font-black text-white/30 uppercase tracking-widest">Or quick join with</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all group">
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-white/70 group-hover:text-white font-bold text-sm transition-colors">Sign up with Google</span>
                            </button>

                            <div className="mt-8 text-center">
                                <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-4">Trust is built-in</p>
                                <div className="flex justify-center gap-8 items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                                    <span className="text-white font-black italic">HIPAA Verified</span>
                                    <span className="text-white font-black italic">AES-256 Secure</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* The 3D Sliding Overlay */}
                    <motion.div
                        initial={false}
                        animate={{
                            x: isLogin ? '99%' : '-1%',
                            rotateY: isLogin ? -10 : 10,
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            backfaceVisibility: 'hidden',
                            willChange: 'transform'
                        }}
                        className="absolute top-0 left-0 w-[51%] h-full bg-gradient-to-br from-emerald-600 to-emerald-950 z-30 shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(16,185,129,0.2)] origin-center flex items-center justify-center overflow-hidden"
                    >
                        {/* Decorative Background for Overlay */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-300 opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        </div>

                        <div className="relative z-10 text-center p-12 flex flex-col items-center">
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-32 h-32 bg-white/10 rounded-[35%] flex items-center justify-center mb-8 backdrop-blur-xl border border-white/20 shadow-2xl relative"
                            >
                                <Activity size={64} className="text-white" strokeWidth={1.5} />
                            </motion.div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'signup' : 'signin'}
                                    initial={{ opacity: 0, scale: 0.8, x: isLogin ? 20 : -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: isLogin ? -20 : 20 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                >
                                    <h3 className="text-4xl font-black text-white mb-6 leading-tight">
                                        {isLogin ? "New to DoctorLink?" : "Return to Health"}
                                    </h3>
                                    <p className="text-emerald-100 font-bold mb-10 text-lg opacity-80 max-w-xs mx-auto">
                                        {isLogin
                                            ? "Stop waiting in lines. Start connecting with specialists today."
                                            : "Your schedule and records are waiting for you inside."}
                                    </p>
                                    <button
                                        onClick={toggleAuth}
                                        className="px-10 py-4 bg-white text-emerald-950 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/30"
                                    >
                                        {isLogin ? "Sign Up Now" : "Sign In"}
                                    </button>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Branding at bottom */}
                        <div className="absolute bottom-8 text-white/40 flex items-center gap-2">
                            <span className="font-black text-sm tracking-tighter uppercase">Doctor<span className="text-white">Link</span></span>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Medical Portal</span>
                        </div>
                    </motion.div>
                </div>

                {/* Return Home Link */}
                <Link to="/" className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30 hover:text-emerald-400 transition-all font-black text-sm group">
                    <motion.div whileHover={{ x: -5 }} className="flex items-center gap-2">
                        ← Back to Home
                    </motion.div>
                </Link>
            </motion.div>

            {/* Global Styles for perspective */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-2000 {
                    perspective: 2000px;
                }
            `}} />
        </div>
    );
};

export default Auth;
