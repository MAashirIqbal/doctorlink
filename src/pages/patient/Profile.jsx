import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Calendar, Camera, Save,
    Activity, Search, Settings, LogOut, CheckCircle2,
    Lock, Eye, EyeOff, Shield
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../api/authAPI';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
    { icon: Search, label: 'Find Doctors', path: '/doctors' },
    { icon: User, label: 'My Profile', path: '/patient/profile', active: true },
];

const PatientProfile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaved, setIsSaved] = useState(false);
    const [avatarData, setAvatarData] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwError, setPwError] = useState('');

    const [profile, setProfile] = useState({
        name: '', email: '', phone: '', dob: '', gender: 'Male', city: '', address: '',
    });

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dob: user.dob || '',
                gender: user.gender || 'Male',
                city: user.city || '',
                address: user.address || '',
            });
            setAvatarData(user.avatar || '');
        }
    }, [user]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            if (typeof base64 === 'string') setAvatarData(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleLogout = () => { localStorage.setItem('lastRole', 'patient'); logout(); navigate('/'); };

    const handleSave = async () => {
        try {
            const { data } = await updateProfile({ name: profile.name, email: profile.email, phone: profile.phone, city: profile.city, dob: profile.dob, gender: profile.gender, address: profile.address, avatar: avatarData });
            if (data.user) updateUser(data.user);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save');
        }
    };

    const handleChangePassword = async () => {
        setPwError('');
        if (passwords.new !== passwords.confirm) { setPwError('Passwords do not match'); return; }
        try {
            await changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
            setPasswords({ current: '', new: '', confirm: '' });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            setPwError(err.response?.data?.message || 'Failed to change password');
        }
    };

    const tabs = [
        { key: 'personal', label: 'Personal Info', icon: User },
        { key: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar */}
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
                    {sidebarLinks.map((link, i) => (
                        <Link key={i} to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${link.active
                                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">{user?.name?.[0]}</div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" /></button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">My Profile</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Manage your personal information and security</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-700/20 active:scale-95"
                        >
                            {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            {isSaved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8 mb-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                {avatarData ? (
                                    <img src={avatarData} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-primary-700 flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-xl">{profile.name?.[0] || 'U'}</div>
                                )}
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl border border-gray-100 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Camera size={18} className="text-primary-700" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 font-display">{profile.name}</h2>
                                <p className="text-gray-500 font-bold">{profile.email}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        <CheckCircle2 size={10} />
                                        Verified Patient
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Member since Jan 2026
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 mb-8 w-fit">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.key
                                    ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8"
                        >
                            <h3 className="text-lg font-black text-gray-900 mb-6 font-display">Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { icon: User, label: 'Full Name', value: profile.name, key: 'name', type: 'text' },
                                    { icon: Mail, label: 'Email Address', value: profile.email, key: 'email', type: 'email' },
                                    { icon: Phone, label: 'Phone Number', value: profile.phone, key: 'phone', type: 'tel' },
                                    { icon: Calendar, label: 'Date of Birth', value: profile.dob, key: 'dob', type: 'date' },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                                        <div className="relative group">
                                            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-600 transition-colors" size={16} />
                                            <input
                                                type={field.type}
                                                value={field.value}
                                                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        value={profile.gender}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-600 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={profile.city}
                                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                                <textarea
                                    rows={3}
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 mb-2 font-display">Change Password</h3>
                                <p className="text-sm font-bold text-gray-400 mb-6">Ensure your account stays secure by using a strong password</p>

                                <div className="space-y-5 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input
                                                type={showCurrentPw ? 'text' : 'password'}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                placeholder="Enter current password"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-12 text-gray-900 font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                            />
                                            <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input
                                                type={showNewPw ? 'text' : 'password'}
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                placeholder="Enter new password"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-12 text-gray-900 font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                            />
                                            <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                placeholder="Confirm new password"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {pwError && <p className="text-red-500 text-xs font-bold">{pwError}</p>}
                                    <button onClick={handleChangePassword} className="px-8 py-4 bg-primary-700 hover:bg-primary-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-700/20 active:scale-95">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 flex-shrink-0">
                                        <Shield size={22} className="text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 font-display">Delete Account</h3>
                                        <p className="text-sm font-bold text-gray-400 mt-1 mb-4">
                                            Once you delete your account, there is no going back. All your data will be permanently removed.
                                        </p>
                                        <button className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-sm hover:bg-red-100 transition-all">
                                            Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Save Toast */}
            {isSaved && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-600/30 flex items-center gap-3 font-black z-50"
                >
                    <CheckCircle2 size={20} />
                    Profile updated successfully!
                </motion.div>
            )}
        </div>
    );
};

export default PatientProfile;
