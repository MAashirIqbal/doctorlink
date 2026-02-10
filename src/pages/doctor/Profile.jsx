import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Briefcase, CreditCard, Clock,
    Camera, Save, Activity, Calendar, Users, Wallet, Settings,
    LogOut, Stethoscope, ClipboardList, Plus, X, CheckCircle2,
    GraduationCap, Languages, Award, Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyDoctorProfile, updateMyDoctorProfile } from '../../api/doctorAPI';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile', active: true },
    { icon: Settings, label: 'Settings', path: '/doctor/settings' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorProfile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [avatarData, setAvatarData] = useState('');

    const [profile, setProfile] = useState({
        name: '', email: '', phone: '', specialization: '', degree: '',
        experience: 0, fee: 0, location: '', about: '', languages: [], pmcNumber: '',
    });

    const defaultAvail = {
        Monday: { enabled: false, start: '09:00', end: '17:00' },
        Tuesday: { enabled: false, start: '09:00', end: '17:00' },
        Wednesday: { enabled: false, start: '09:00', end: '17:00' },
        Thursday: { enabled: false, start: '09:00', end: '17:00' },
        Friday: { enabled: false, start: '09:00', end: '14:00' },
        Saturday: { enabled: false, start: '10:00', end: '14:00' },
        Sunday: { enabled: false, start: '', end: '' },
    };
    const [availability, setAvailability] = useState(defaultAvail);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getMyDoctorProfile();
                const d = data.doctor || {};
                setProfile({
                    name: d.fullName || d.user?.name || '',
                    email: d.user?.email || '',
                    phone: d.user?.phone || '',
                    specialization: d.specialization || '',
                    degree: d.degree || '',
                    experience: d.experience || 0,
                    fee: d.fee || 0,
                    location: d.location || '',
                    about: d.about || '',
                    languages: d.languages || [],
                    pmcNumber: d.pmcNumber || '',
                });
                setAvatarData(d.avatar || d.user?.avatar || '');
                if (d.schedule?.length) {
                    const mapped = { ...defaultAvail };
                    d.schedule.forEach(s => {
                        if (mapped[s.day]) mapped[s.day] = { enabled: s.isActive !== false, start: s.startTime || '09:00', end: s.endTime || '17:00' };
                    });
                    setAvailability(mapped);
                }
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

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

    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

    const handleSave = async () => {
        try {
            await updateMyDoctorProfile({
                fullName: profile.name,
                specialization: profile.specialization,
                degree: profile.degree,
                experience: Number(profile.experience),
                fee: Number(profile.fee),
                location: profile.location,
                about: profile.about,
                languages: profile.languages,
                avatar: avatarData,
            });
            updateUser({
                ...(user || {}),
                name: profile.name,
                avatar: avatarData,
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save profile');
        }
    };

    const tabs = [
        { key: 'personal', label: 'Personal Info', icon: User },
        { key: 'professional', label: 'Professional', icon: Stethoscope },
        { key: 'availability', label: 'Availability', icon: Clock },
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
                    <div className="mt-4 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 inline-flex items-center gap-1.5">
                        <Stethoscope size={12} className="text-emerald-700" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Doctor Portal</span>
                    </div>
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
                            <p className="text-[10px] font-bold text-primary-700 truncate">{user?.email}</p>
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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Profile Management</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Update your professional information and availability</p>
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
                    {/* Profile Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-gray-100 p-8 mb-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                {avatarData ? (
                                    <img src={avatarData} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-primary-700 flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-xl">{profile.name?.[0] || 'D'}</div>
                                )}
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl border border-gray-100 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Camera size={18} className="text-primary-700" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 font-display">{profile.name}</h2>
                                <p className="text-primary-700 font-bold">{profile.specialization} • {profile.degree}</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                        <Award size={12} className="text-emerald-600" />
                                        PMC Verified
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                        <Globe size={12} className="text-primary-600" />
                                        {profile.pmcNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 mb-8 w-fit">
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

                    {/* Tab Content */}
                    {activeTab === 'personal' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-100 p-8"
                        >
                            <h3 className="text-lg font-black text-gray-900 mb-6 font-display">Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { icon: User, label: 'Full Name', value: profile.name, key: 'name', type: 'text' },
                                    { icon: Mail, label: 'Email Address', value: profile.email, key: 'email', type: 'email' },
                                    { icon: Phone, label: 'Phone Number', value: profile.phone, key: 'phone', type: 'tel' },
                                    { icon: MapPin, label: 'Clinic Location', value: profile.location, key: 'location', type: 'text' },
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
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About / Bio</label>
                                <textarea
                                    rows={4}
                                    value={profile.about}
                                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all resize-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'professional' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-100 p-8"
                        >
                            <h3 className="text-lg font-black text-gray-900 mb-6 font-display">Professional Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialization</label>
                                    <div className="relative group">
                                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input type="text" value={profile.specialization}
                                            onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Degree / Qualification</label>
                                    <div className="relative group">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input type="text" value={profile.degree}
                                            onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Years of Experience</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input type="number" value={profile.experience}
                                            onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consultation Fee (PKR)</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input type="number" value={profile.fee}
                                            onChange={(e) => setProfile({ ...profile, fee: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 focus:bg-white transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="mt-6 space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Languages Spoken</label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages.map((lang, i) => (
                                        <span key={i} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-black border border-primary-100">
                                            {lang}
                                            <button onClick={() => setProfile({ ...profile, languages: profile.languages.filter((_, idx) => idx !== i) })} className="text-primary-400 hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-sm font-black border border-gray-100 border-dashed hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all">
                                        <Plus size={12} />
                                        Add Language
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'availability' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-100 p-8"
                        >
                            <h3 className="text-lg font-black text-gray-900 mb-2 font-display">Weekly Availability</h3>
                            <p className="text-sm font-bold text-gray-400 mb-8">Set your available days and working hours</p>

                            <div className="space-y-4">
                                {daysOfWeek.map((day) => (
                                    <div key={day} className={`flex items-center gap-6 p-5 rounded-2xl border transition-all ${availability[day].enabled
                                        ? 'bg-white border-primary-100'
                                        : 'bg-gray-50/50 border-gray-100'
                                        }`}>
                                        {/* Toggle */}
                                        <button
                                            onClick={() => setAvailability({
                                                ...availability,
                                                [day]: { ...availability[day], enabled: !availability[day].enabled }
                                            })}
                                            className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${availability[day].enabled ? 'bg-primary-700' : 'bg-gray-200'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${availability[day].enabled ? 'left-6' : 'left-1'
                                                }`} />
                                        </button>

                                        {/* Day Name */}
                                        <span className={`w-28 text-sm font-black ${availability[day].enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {day}
                                        </span>

                                        {/* Time Inputs */}
                                        {availability[day].enabled ? (
                                            <div className="flex items-center gap-3 flex-1">
                                                <input
                                                    type="time"
                                                    value={availability[day].start}
                                                    onChange={(e) => setAvailability({
                                                        ...availability,
                                                        [day]: { ...availability[day], start: e.target.value }
                                                    })}
                                                    className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200 transition-all"
                                                />
                                                <span className="text-gray-400 font-bold text-sm">to</span>
                                                <input
                                                    type="time"
                                                    value={availability[day].end}
                                                    onChange={(e) => setAvailability({
                                                        ...availability,
                                                        [day]: { ...availability[day], end: e.target.value }
                                                    })}
                                                    className="bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200 transition-all"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold text-gray-400 italic">Unavailable</span>
                                        )}
                                    </div>
                                ))}
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

export default DoctorProfile;
