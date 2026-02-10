import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Activity, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await loginUser({ email, password });
            if (data.user.role !== 'admin') {
                setError('Access denied. Admin credentials required.');
                setLoading(false);
                return;
            }
            login(data.token, data.user);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], y: [0, 100, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-[150px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md z-10"
            >
                <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 p-10 shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2.5 mb-3">
                        <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-600/30">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight font-display text-white">
                            Doctor<span className="text-emerald-500">Link</span>
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Shield size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Admin Portal</span>
                    </div>

                    <h2 className="text-2xl font-black text-white text-center mb-1 font-display">Admin Login</h2>
                    <p className="text-white/40 text-sm font-bold text-center mb-8">Restricted access — authorized personnel only</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 mb-6"
                        >
                            <AlertCircle size={16} className="text-emerald-400 flex-shrink-0" />
                            <p className="text-emerald-200 text-sm font-bold">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@doctorlink.pk"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield size={18} />
                                    Access Admin Panel
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
