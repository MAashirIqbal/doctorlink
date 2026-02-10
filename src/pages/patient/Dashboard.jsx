import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Bell, Search, ArrowRight, Star,
    MapPin, Activity, Settings, LogOut,
    ChevronRight, TrendingUp, CalendarCheck, AlertCircle, Stethoscope
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard, getMyAppointments } from '../../api/appointmentAPI';
import NotificationDropdown from '../../components/NotificationDropdown';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/patient/dashboard', active: true },
    { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
    { icon: Search, label: 'Find Doctors', path: '/doctors' },
    { icon: User, label: 'My Profile', path: '/patient/profile' },
];

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ upcoming: 0, completed: 0, doctors: 0, total: 0 });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentDoctors, setRecentDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, aptRes] = await Promise.all([
                    getPatientDashboard(),
                    getMyAppointments({ status: 'confirmed,pending', limit: 5 }),
                ]);
                const s = dashRes.data.stats || {};
                setStats({
                    upcoming: s.upcomingAppointments || 0,
                    completed: s.completedAppointments || 0,
                    doctors: s.doctorsConsulted || 0,
                    total: s.totalAppointments || 0,
                });
                setUpcomingAppointments(dashRes.data.upcomingAppointments || aptRes.data.appointments || []);
                setRecentDoctors(dashRes.data.recentDoctors || []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.setItem('lastRole', 'patient');
        logout();
        navigate('/');
    };

    const statusColors = {
        confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        cancelled: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
                {/* Brand */}
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

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link, i) => (
                        <Link
                            key={i}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${link.active
                                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                                {user?.name?.[0] || 'P'}
                            </div>
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
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">
                                Welcome back, <span className="text-primary-700">{user?.name?.split(' ')[0]}</span>
                            </h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Here's your health overview for today</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-56 transition-all"
                                />
                            </div>
                            <NotificationDropdown />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { icon: CalendarCheck, label: 'Upcoming', value: String(stats.upcoming || 0), sub: 'Appointments', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: TrendingUp, label: 'Completed', value: String(stats.completed || 0), sub: 'Total Visits', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { icon: Stethoscope, label: 'Doctors', value: String(stats.doctors || 0), sub: 'Consulted With', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: Star, label: 'Total', value: String(stats.total || 0), sub: 'All Appointments', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm shadow-gray-200/50 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center border ${stat.border}`}>
                                        <stat.icon size={22} className={stat.color} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-sm font-bold text-gray-400 mt-1">{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Upcoming Appointments */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-black text-gray-900 font-display">Upcoming Appointments</h2>
                                    <Link to="/patient/appointments" className="text-xs font-black text-primary-700 uppercase tracking-widest hover:text-primary-800 flex items-center gap-1">
                                        View All <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {upcomingAppointments.map((apt, i) => (
                                        <motion.div
                                            key={apt._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + i * 0.1 }}
                                            className="p-6 hover:bg-primary-50/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                {apt.doctor?.avatar ? (
                                                    <img src={apt.doctor.avatar} alt={apt.doctor.fullName} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg border-2 border-white shadow-sm">
                                                        {apt.doctor?.fullName?.[0] || 'D'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-black text-gray-900">{apt.doctor?.fullName || 'Doctor'}</h3>
                                                            <p className="text-sm font-bold text-primary-700">{apt.doctor?.specialization}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[apt.status] || statusColors.pending}`}>
                                                            {apt.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-3 text-sm font-bold text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar size={12} className="text-primary-600" />
                                                            {new Date(apt.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-primary-600" />
                                                            {apt.timeSlot}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin size={12} className="text-primary-600" />
                                                            {apt.doctor?.location?.split(',')?.[0] || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {upcomingAppointments.length === 0 && (
                                    <div className="p-12 text-center">
                                        <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold">No upcoming appointments</p>
                                        <Link to="/doctors" className="text-primary-700 font-black text-sm mt-2 inline-block">
                                            Book one now →
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Health Tip */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-[60px]" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle size={16} className="text-emerald-200" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Daily Health Tip</span>
                                    </div>
                                    <p className="text-lg font-black leading-relaxed">
                                        Regular health checkups can detect potential issues early. Schedule your annual wellness visit today.
                                    </p>
                                    <Link to="/doctors" className="inline-flex items-center gap-2 mt-4 text-sm font-black text-emerald-200 hover:text-white transition-colors">
                                        Find a Specialist <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 text-center"
                            >
                                <div className="relative inline-block mb-4">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-primary-700 flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg">
                                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 font-display">{user?.name}</h3>
                                <p className="text-sm font-bold text-gray-400 mb-1">{user?.email}</p>
                                <p className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Patient</p>

                                <Link to="/patient/profile" className="block mt-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 transition-all">
                                    Edit Profile
                                </Link>
                            </motion.div>

                            {/* Recent Doctors */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 font-display">Recent Doctors</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {recentDoctors.slice(0, 3).map((doc, i) => (
                                        <Link key={doc._id} to={`/doctors/${doc._id}`} className="flex items-center gap-3 p-4 hover:bg-primary-50/30 transition-colors">
                                            {doc.avatar ? (
                                                <img src={doc.avatar} alt={doc.fullName} className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm border border-white shadow-sm">
                                                    {doc.fullName?.[0] || 'D'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-900 truncate">{doc.fullName}</p>
                                                <p className="text-xs font-bold text-gray-400">{doc.specialization}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                                <span className="text-xs font-black text-gray-700">{doc.rating || '-'}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                            >
                                <h3 className="text-lg font-black text-gray-900 font-display mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    {[
                                        { icon: Search, label: 'Find a Doctor', path: '/doctors', color: 'text-primary-700' },
                                        { icon: Calendar, label: 'My Appointments', path: '/patient/appointments', color: 'text-emerald-700' },
                                        { icon: User, label: 'Edit Profile', path: '/patient/profile', color: 'text-amber-600' },
                                    ].map((action, i) => (
                                        <Link key={i} to={action.path} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-primary-50 hover:border-primary-100 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <action.icon size={16} className={action.color} />
                                                <span className="text-sm font-black text-gray-700 group-hover:text-primary-700">{action.label}</span>
                                            </div>
                                            <ArrowRight size={14} className="text-gray-400 group-hover:text-primary-700 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
