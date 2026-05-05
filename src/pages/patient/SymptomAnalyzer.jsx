import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Sparkles, AlertTriangle, ShieldAlert, ImagePlus,
    X, ArrowRight, Stethoscope, Heart, Calendar, User, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { analyzeSymptoms } from '../../api/aiAPI';
import { FILE_BASE, resolveFileUrl } from '../../api/axios';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
    { icon: Sparkles, label: 'Symptom Analyzer', path: '/patient/symptom-analyzer', active: true },
    { icon: User, label: 'Profile', path: '/patient/profile' },
];

const severityStyle = {
    mild: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    moderate: 'bg-amber-50 text-amber-700 border-amber-100',
    severe: 'bg-orange-50 text-orange-700 border-orange-100',
    emergency: 'bg-red-50 text-red-700 border-red-100',
};

const SymptomAnalyzer = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [symptoms, setSymptoms] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            toast.error('Image must be smaller than 4 MB');
            return;
        }
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        if (symptoms.trim().length < 5) {
            setError('Please describe your symptoms in at least 5 characters');
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('symptoms', symptoms);
            if (age) fd.append('age', age);
            if (gender) fd.append('gender', gender);
            if (image) fd.append('image', image);
            const { data } = await analyzeSymptoms(fd);
            setResult(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Analysis failed. Please try again.';
            if (err.response?.data?.valid === false) {
                setResult({ success: false, valid: false, message: msg });
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const sevClass = severityStyle[result?.severity] || severityStyle.mild;

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
                <div className="p-6 border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-primary-700 p-2 rounded-xl shadow-sm">
                            <Activity className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight font-display text-gray-900">
                            Doctor<span className="text-primary-700">Link</span>
                        </span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((l, i) => (
                        <Link key={i} to={l.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${l.active ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <l.icon size={18} />
                            {l.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm">{user?.name?.[0] || 'P'}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Symptom Analyzer</h1>
                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100 inline-flex items-center gap-1">
                                <Sparkles size={10} /> AI
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 mt-0.5">Describe what you feel — we'll suggest the right specialist.</p>
                    </div>
                </header>

                <div className="p-8 max-w-5xl">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
                        <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-amber-800 leading-relaxed">
                            This tool is for triage guidance only. It is <span className="underline">not</span> a medical diagnosis.
                            For emergencies call <span className="font-black">1122</span> or go to the nearest ER.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8 mb-8 space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Describe your symptoms</label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={5}
                                maxLength={1500}
                                placeholder="e.g. I've had a sore throat, fever, and body aches for 3 days. Cough is dry and worse at night."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 transition-all"
                            />
                            <div className="flex justify-end text-[10px] font-bold text-gray-400 mt-1">{symptoms.length}/1500</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Age (optional)</label>
                                <input type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)}
                                    placeholder="35"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Gender (optional)</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200">
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Attach a photo (optional, e.g., rash, swelling, wound)</label>
                            {imagePreview ? (
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="symptom preview" className="max-h-48 rounded-2xl border border-gray-200" />
                                    <button type="button" onClick={() => { setImage(null); setImagePreview(''); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-primary-200 transition-all">
                                    <ImagePlus size={20} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500">Click to upload an image (max 4 MB, medical relevance only)</span>
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} />
                                </label>
                            )}
                        </div>

                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                        <button type="submit" disabled={loading}
                            className="w-full bg-primary-700 hover:bg-primary-600 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-primary-700/20 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analyzing...</>
                            ) : (
                                <><Sparkles size={18} /> Analyze Symptoms</>
                            )}
                        </button>
                    </form>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                {result.valid === false ? (
                                    <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 flex items-start gap-3">
                                        <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm font-bold text-gray-700">{result.message}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`rounded-3xl border p-6 ${sevClass}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Severity Assessment</span>
                                                <span className="text-xs font-black uppercase tracking-widest">{result.severity}</span>
                                            </div>
                                            <p className="text-sm font-black leading-relaxed">{result.summary}</p>
                                        </div>

                                        {result.severity === 'emergency' && (
                                            <div className="bg-red-600 text-white rounded-3xl p-6 flex items-start gap-3">
                                                <AlertTriangle size={22} className="flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-base font-black">This may be an emergency.</p>
                                                    <p className="text-sm font-bold opacity-90 mt-1">Call 1122 or go to the nearest ER immediately. Do not wait for an appointment.</p>
                                                </div>
                                            </div>
                                        )}

                                        {result.specializations?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Suggested Specialists</h3>
                                                <div className="space-y-3">
                                                    {result.specializations.map((s, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><Stethoscope size={18} className="text-primary-700" /></div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-sm font-black text-gray-900">{s.name}</p>
                                                                    <span className="text-[10px] font-black text-primary-700">{Math.round((s.confidence || 0) * 100)}% match</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-gray-500 mt-1">{s.reason}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {result.redFlags?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6">
                                                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">Red Flags to Watch</h3>
                                                <ul className="space-y-2">
                                                    {result.redFlags.map((f, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm font-bold text-gray-700">
                                                            <span className="text-orange-500 mt-1">•</span> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {result.selfCare?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
                                                <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Safe Self-Care Tips</h3>
                                                <ul className="space-y-2">
                                                    {result.selfCare.map((tip, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm font-bold text-gray-700">
                                                            <span className="text-emerald-600 mt-1">✓</span> {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {result.recommendedDoctors?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Doctors Available on DoctorLink</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {result.recommendedDoctors.map((d) => (
                                                        <div key={d._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                            {d.avatar ? (
                                                                <img src={resolveFileUrl(d.avatar)} className="w-12 h-12 rounded-xl object-cover" alt={d.fullName} />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black">{d.fullName?.[0]}</div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-black text-gray-900 truncate">{d.fullName}</p>
                                                                <p className="text-xs font-bold text-primary-700 truncate">{d.specialization}</p>
                                                                <p className="text-[10px] font-bold text-gray-400">Rs. {d.fee?.toLocaleString()} · ⭐ {d.rating || 'New'}</p>
                                                            </div>
                                                            <Link to={`/book-appointment/${d._id}`} className="p-2 bg-primary-700 text-white rounded-xl hover:bg-primary-600">
                                                                <ArrowRight size={14} />
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                                            <Heart size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-[11px] font-bold text-gray-500 leading-relaxed">{result.disclaimer}</p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default SymptomAnalyzer;
