import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/authAPI';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(token, { password });
            setDone(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a1a15] flex items-center justify-center p-4 relative overflow-hidden font-display">
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
                        <h2 className="text-3xl font-black text-white mb-3">Set New Password</h2>
                        <p className="text-white/40 font-bold leading-relaxed px-4">
                            Choose a password you'll remember. At least 6 characters.
                        </p>
                    </div>

                    {!done ? (
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">New password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">Confirm password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

                            <button
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/40 active:scale-95"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-6">
                                <p className="text-emerald-400 font-bold text-lg mb-2">Password reset</p>
                                <p className="text-white/50 text-sm font-bold">Redirecting to login...</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-center">
                        <Link to="/login" className="flex items-center gap-2 text-white/30 hover:text-emerald-400 transition-all font-black text-sm group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
