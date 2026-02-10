import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Activity, LogOut,
    Users, Wallet, ClipboardList, Stethoscope, Save,
    CheckCircle2, Plus, X, Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyDoctorProfile, updateMySchedule } from '../../api/doctorAPI';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule', active: true },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

// Normalize '9:00 AM' → '09:00 AM' for consistent comparison
const normalizeSlot = (slot) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return slot;
    return `${match[1].padStart(2, '0')}:${match[2]} ${match[3].toUpperCase()}`;
};

const DoctorSchedule = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [slotDuration, setSlotDuration] = useState(30);
    const [loading, setLoading] = useState(true);

    const emptySchedule = {
        Monday: { enabled: false, slots: [] },
        Tuesday: { enabled: false, slots: [] },
        Wednesday: { enabled: false, slots: [] },
        Thursday: { enabled: false, slots: [] },
        Friday: { enabled: false, slots: [] },
        Saturday: { enabled: false, slots: [] },
        Sunday: { enabled: false, slots: [] },
    };

    const [schedule, setSchedule] = useState(emptySchedule);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getMyDoctorProfile();
                const backendSchedule = data.doctor?.schedule || [];
                const mapped = { ...emptySchedule };
                backendSchedule.forEach(s => {
                    if (mapped[s.day] !== undefined) {
                        mapped[s.day] = { enabled: s.isActive !== false, slots: (s.slots || []).map(normalizeSlot) };
                    }
                });
                setSchedule(mapped);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

    const toggleDay = (day) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], enabled: !schedule[day].enabled, slots: !schedule[day].enabled ? [] : schedule[day].slots }
        });
    };

    const toggleSlot = (day, slot) => {
        const currentSlots = schedule[day].slots;
        const newSlots = currentSlots.includes(slot)
            ? currentSlots.filter(s => s !== slot)
            : [...currentSlots, slot].sort((a, b) => {
                const toMin = (t) => {
                    const [time, period] = t.split(' ');
                    let [h, m] = time.split(':').map(Number);
                    if (period === 'PM' && h !== 12) h += 12;
                    if (period === 'AM' && h === 12) h = 0;
                    return h * 60 + m;
                };
                return toMin(a) - toMin(b);
            });
        setSchedule({ ...schedule, [day]: { ...schedule[day], slots: newSlots } });
    };

    const clearDay = (day) => {
        setSchedule({ ...schedule, [day]: { ...schedule[day], slots: [] } });
    };

    const selectAllSlots = (day) => {
        setSchedule({ ...schedule, [day]: { ...schedule[day], slots: [...defaultSlots] } });
    };

    const handleSave = async () => {
        try {
            const payload = Object.entries(schedule).map(([day, val]) => ({
                day,
                isActive: val.enabled,
                slots: val.slots,
            }));
            await updateMySchedule({ schedule: payload });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save schedule');
        }
    };

    const totalSlots = Object.values(schedule).reduce((acc, day) => acc + (day.enabled ? day.slots.length : 0), 0);
    const activeDays = Object.values(schedule).filter(d => d.enabled).length;

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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Schedule Management</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Set your available days and time slots for patients</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-700/20 active:scale-95"
                        >
                            {isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                            {isSaved ? 'Saved!' : 'Save Schedule'}
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        {[
                            { label: 'Active Days', value: activeDays, sub: 'per week', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100', icon: Calendar },
                            { label: 'Total Slots', value: totalSlots, sub: 'available', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Clock },
                            { label: 'Slot Duration', value: `${slotDuration} min`, sub: 'per appointment', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: ClipboardList },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm shadow-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center border ${stat.border}`}>
                                        <stat.icon size={18} className={stat.color} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-xs font-bold text-gray-400 mt-0.5">{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Schedule Grid */}
                    <div className="space-y-6">
                        {daysOfWeek.map((day, dayIdx) => (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + dayIdx * 0.05 }}
                                className={`bg-white rounded-2xl border transition-all ${schedule[day].enabled
                                    ? 'border-gray-200/60 shadow-sm shadow-gray-200/50 hover:border-primary-100'
                                    : 'border-gray-100 opacity-60'
                                    }`}
                            >
                                {/* Day Header */}
                                <div className="flex items-center justify-between p-5 border-b border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => toggleDay(day)}
                                            className={`w-12 h-7 rounded-full transition-all relative flex-shrink-0 ${schedule[day].enabled ? 'bg-primary-700' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${schedule[day].enabled ? 'left-6' : 'left-1'}`} />
                                        </button>
                                        <div>
                                            <h3 className={`text-lg font-black ${schedule[day].enabled ? 'text-gray-900' : 'text-gray-400'}`}>{day}</h3>
                                            <p className="text-xs font-bold text-gray-400">
                                                {schedule[day].enabled
                                                    ? `${schedule[day].slots.length} slot${schedule[day].slots.length !== 1 ? 's' : ''} selected`
                                                    : 'Unavailable'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {schedule[day].enabled && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => selectAllSlots(day)}
                                                className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all"
                                            >
                                                Select All
                                            </button>
                                            <button
                                                onClick={() => clearDay(day)}
                                                className="px-3 py-1.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Time Slots */}
                                {schedule[day].enabled && (
                                    <div className="p-5">
                                        <div className="flex flex-wrap gap-2">
                                            {defaultSlots.map((slot) => {
                                                const isSelected = schedule[day].slots.includes(slot);
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => toggleSlot(day, slot)}
                                                        className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all ${isSelected
                                                            ? 'bg-primary-700 text-white shadow-md shadow-primary-700/15'
                                                            : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
                                                            }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
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
                    Schedule saved successfully!
                </motion.div>
            )}
        </div>
    );
};

export default DoctorSchedule;
