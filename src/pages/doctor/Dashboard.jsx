import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Bell, Search, ArrowRight, Star,
    Activity, LogOut, Stethoscope, DollarSign,
    ChevronRight, TrendingUp, CalendarCheck, Users, CheckCircle2,
    XCircle, AlertCircle, BarChart3, Wallet, ClipboardList
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDashboard, getMyEarnings, getDoctorReviews } from '../../api/doctorAPI';
import { getDoctorAppointments, acceptAppointment, rejectAppointment } from '../../api/appointmentAPI';
import NotificationDropdown from '../../components/NotificationDropdown';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard', active: true },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, monthEarnings: 0, rating: 0, totalReviews: 0 });
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [recentEarnings, setRecentEarnings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [dashRes, aptRes, earnRes] = await Promise.all([
                getDoctorDashboard(),
                getDoctorAppointments({ status: 'confirmed,pending' }),
                getMyEarnings(),
            ]);


            const monthEarnings = (earnRes.data.monthlyEarnings && earnRes.data.monthlyEarnings[0]?.total) || 0;
            setStats({
                ...(dashRes.data.stats || {}),
                monthEarnings,
            });

            setTodayAppointments(dashRes.data.todaySchedule || []);
            setRecentEarnings(earnRes.data.recentPayments || []);

            // Fetch reviews if we have doctorId
            if (dashRes.data.doctorId) {
                try {
                    const revRes = await getDoctorReviews(dashRes.data.doctorId);
                    setReviews(revRes.data.reviews || []);
                } catch (e) { /* reviews are optional */ }
            }
        } catch (err) {
            console.error('Doctor dashboard error:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAccept = async (id) => { try { await acceptAppointment(id); fetchData(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleReject = async (id) => { try { await rejectAppointment(id); fetchData(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

    const statusColors = {
        confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
    };

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
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">
                                {getGreeting()}, <span className="text-primary-700">{user?.name?.split(' ')[0]}</span>
                            </h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">You have <span className="text-emerald-600 font-black">{todayAppointments.length} appointments</span> today</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">{user?.name?.[0]}</div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { icon: CalendarCheck, label: "Today's", value: String(stats.todayAppointments || todayAppointments.length), sub: 'Appointments', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: Users, label: 'Total', value: `${(stats.totalPatients || 0).toLocaleString()}+`, sub: 'Patients Served', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { icon: TrendingUp, label: 'This Month', value: `Rs. ${((stats.monthEarnings || 0) / 1000).toFixed(0)}K`, sub: 'Earnings', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { icon: Star, label: 'Rating', value: String(stats.rating || 0), sub: `${stats.totalReviews || 0} Reviews`, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm shadow-gray-200/50 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
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
                        {/* Today's Appointments */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-black text-gray-900 font-display">Today's Schedule</h2>
                                    <Link to="/doctor/appointments" className="text-xs font-black text-primary-700 uppercase tracking-widest hover:text-primary-800 flex items-center gap-1">
                                        View All <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {todayAppointments.slice(0, 6).map((apt, i) => (
                                        <motion.div
                                            key={apt._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 + i * 0.07 }}
                                            className="p-5 hover:bg-primary-50/30 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/doctor/appointments/${apt._id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center w-16 flex-shrink-0">
                                                    <p className="text-sm font-black text-gray-900">{apt.timeSlot}</p>
                                                </div>
                                                <div className="w-px h-10 bg-gray-100" />
                                                {apt.patient?.avatar ? (
                                                    <img src={apt.patient.avatar} alt={apt.patient.name} className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm border-2 border-white shadow-sm">{apt.patient?.name?.[0] || 'P'}</div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-black text-gray-900 text-sm">{apt.patient?.name || 'Patient'}</h3>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-500">{new Date(apt.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[apt.status] || statusColors.pending}`}>
                                                    {apt.status}
                                                </span>
                                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleAccept(apt._id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all" title="Accept">
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleReject(apt._id)} className="p-2 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 transition-all" title="Reject">
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {todayAppointments.length === 0 && (
                                        <div className="p-12 text-center">
                                            <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-500 font-bold">No appointments yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Earnings Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-6 text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px]" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-200">This Month</p>
                                            <p className="text-3xl font-black mt-1">Rs. {(stats.monthEarnings || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                                            <Wallet size={22} className="text-white" />
                                        </div>
                                    </div>
                                    <Link to="/doctor/earnings" className="flex items-center gap-2 text-emerald-300 text-sm font-black hover:text-white transition-colors">
                                        <TrendingUp size={14} />
                                        <span>View Full Report</span>
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Recent Earnings */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 font-display">Recent Earnings</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {recentEarnings.slice(0, 5).map((entry, i) => (
                                        <div key={entry._id || i} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{new Date(entry.createdAt || entry.date).toLocaleDateString()}</p>
                                                <p className="text-xs font-bold text-gray-400">{entry.patient?.name || 'Patient'}</p>
                                            </div>
                                            <span className="text-sm font-black text-emerald-700">+Rs. {(entry.doctorEarning || entry.amount || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {recentEarnings.length === 0 && <p className="p-6 text-center text-gray-400 font-bold">No earnings yet</p>}
                                </div>
                                <div className="p-4">
                                    <Link to="/doctor/earnings" className="block text-center py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 transition-all">
                                        View Full Report
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Recent Reviews */}
                            {reviews.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                                >
                                    <div className="p-5 border-b border-gray-50">
                                        <h3 className="text-lg font-black text-gray-900 font-display">Patient Reviews</h3>
                                        <p className="text-xs font-bold text-gray-400 mt-0.5">{stats.rating?.toFixed(1)} avg from {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {reviews.slice(0, 3).map((rev, i) => (
                                            <div key={rev._id || i} className="p-4">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-sm font-black text-gray-900">{rev.patient?.name || 'Patient'}</p>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, j) => (
                                                            <Star key={j} size={12} className={j < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {rev.comment && <p className="text-xs font-bold text-gray-500 line-clamp-2">{rev.comment}</p>}
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

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
                                        { icon: ClipboardList, label: 'Manage Schedule', path: '/doctor/schedule', color: 'text-primary-700' },
                                        { icon: User, label: 'Update Profile', path: '/doctor/profile', color: 'text-emerald-700' },
                                        { icon: BarChart3, label: 'View Analytics', path: '/doctor/earnings', color: 'text-amber-600' },
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

export default DoctorDashboard;
