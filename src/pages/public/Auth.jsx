import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Facebook, Stethoscope, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Auth = () => {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        if (location.pathname === '/register') {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }, [location.pathname]);

    const toggleAuth = () => setIsLogin(!isLogin);

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

                        <form className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-xs font-black text-emerald-500/70 hover:text-emerald-400 uppercase tracking-tighter">Forgot Password?</a>
                                </div>
                            </div>

                            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-2 group">
                                Sign In
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-10">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink mx-4 text-xs font-black text-white/30 uppercase tracking-widest">Or login with</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center transition-all group">
                                    <Github className="text-white/50 group-hover:text-white transition-colors" size={20} />
                                </button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center transition-all group">
                                    <Facebook className="text-white/50 group-hover:text-white transition-colors" size={20} />
                                </button>
                            </div>
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

                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={18} />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
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
                                            placeholder="j@example.com"
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
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white font-bold text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-1">
                                <input type="checkbox" className="w-5 h-5 rounded border-white/10 bg-white/5 accent-emerald-500" />
                                <span className="text-xs font-bold text-white/40">I agree to the <a href="#" className="text-emerald-500 underline">Terms of Service</a></span>
                            </div>

                            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-2 group mt-2">
                                Start Your Journey
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-4">Trust is built-in</p>
                            <div className="flex justify-center gap-8 items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                                <span className="text-white font-black italic">HIPAA Verified</span>
                                <span className="text-white font-black italic">AES-256 Secure</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* The 3D Sliding Overlay */}
                    <motion.div
                        initial={false}
                        animate={{
                            x: isLogin ? '100%' : '0%',
                            rotateY: isLogin ? -10 : 10,
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            backfaceVisibility: 'hidden',
                            willChange: 'transform'
                        }}
                        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-emerald-600 to-emerald-950 z-30 shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.5)] origin-center flex items-center justify-center overflow-hidden"
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
                                <Stethoscope size={64} className="text-white" strokeWidth={1.5} />
                                <motion.div
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-4 -right-4"
                                >
                                    <Sparkles className="text-emerald-300" size={32} />
                                </motion.div>
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
