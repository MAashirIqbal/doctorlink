import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-[#0a1a15] flex items-center justify-center p-4 relative overflow-hidden font-display">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-700/10 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 p-10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 relative">
                            <ShieldCheck size={40} className="text-emerald-400" />
                            <motion.div
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-2 -right-2 text-emerald-300"
                            >
                                <Sparkles size={20} />
                            </motion.div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">Forgot Password?</h2>
                        <p className="text-white/40 font-bold leading-relaxed px-4">
                            No worries, it happens. Enter your email and we'll send you recovery instructions.
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95 flex items-center justify-center gap-2 group">
                                Send Instructions
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8">
                                <p className="text-emerald-400 font-bold text-lg mb-2">Check your inbox!</p>
                                <p className="text-white/50 text-sm font-bold">We've sent recovery steps to <br /> <span className="text-white">{email}</span></p>
                            </div>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-emerald-500 font-black text-sm uppercase tracking-widest hover:text-emerald-400 transition-colors"
                            >
                                Didn't receive it? Try again
                            </button>
                        </motion.div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-center">
                        <Link to="/login" className="flex items-center gap-2 text-white/30 hover:text-emerald-400 transition-all font-black text-sm group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Secure Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                        Secure Recovery Portal • DoctorLink Systems
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
