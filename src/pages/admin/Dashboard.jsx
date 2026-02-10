import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, DollarSign, TrendingUp, Bell,
    Search, Settings, LogOut, Shield, ChevronRight, ArrowRight,
    CheckCircle2, XCircle, AlertCircle, Eye, Ban, UserCheck,
    Stethoscope, BarChart3, CreditCard, Clock, Star, MapPin,
    FileText, LayoutDashboard, UserX, RefreshCw, Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboard, getPendingDoctors, approveDoctor, rejectDoctor, getAllAppointments, getAllUsers } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', active: true },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Users, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Cancelled' },
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, activeDoctors: 0, totalAppointments: 0, totalRevenue: 0 });
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [dashRes, docRes] = await Promise.all([
                getAdminDashboard(),
                getPendingDoctors(),
            ]);

            const s = dashRes.data.stats || {};
            setStats({
                ...s,
                activeDoctors: s.totalDoctors || 0,
                platformFees: s.platformRevenue || 0,
            });

            setPendingDoctors(docRes.data.doctors || []);
            setRecentAppointments(dashRes.data.recentAppointments || []);
            setRecentUsers(dashRes.data.recentUsers || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id) => { try { await approveDoctor(id); fetchData(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleReject = async (id) => { try { await rejectDoctor(id); fetchData(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

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
                    <div className="mt-4 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100 inline-flex items-center gap-1.5">
                        <Shield size={12} className="text-red-600" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Admin Panel</span>
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
                            {link.label === 'Doctor Approvals' && (
                                <span className="ml-auto w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">{pendingDoctors.length}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                            <Shield size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'Admin'}</p>
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
                                Admin <span className="text-primary-700">Dashboard</span>
                            </h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">System overview and management controls</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-56 transition-all"
                                />
                            </div>
                            <button className="relative p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition-all">
                                <Bell size={18} />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-black flex items-center justify-center">5</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* System Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { icon: Users, label: 'Total Users', value: (stats.totalUsers || 0).toLocaleString(), change: '', up: true, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: Stethoscope, label: 'Active Doctors', value: (stats.activeDoctors || 0).toLocaleString(), change: '', up: true, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { icon: Calendar, label: 'Appointments', value: (stats.totalAppointments || 0).toLocaleString(), change: '', up: true, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { icon: DollarSign, label: 'Revenue', value: `Rs. ${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`, change: '', up: true, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
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
                                    <div className={`flex items-center gap-1 text-xs font-black ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                                        <TrendingUp size={12} />
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Pending Doctor Approvals */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-black text-gray-900 font-display">Pending Doctor Approvals</h2>
                                        <span className="w-6 h-6 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">{pendingDoctors.length}</span>
                                    </div>
                                    <Link to="/admin/approvals" className="text-xs font-black text-primary-700 uppercase tracking-widest hover:text-primary-800 flex items-center gap-1">
                                        View All <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {pendingDoctors.length === 0 && <p className="p-6 text-center text-gray-400 font-bold">No pending approvals</p>}
                                    {pendingDoctors.map((doc, i) => (
                                        <motion.div
                                            key={doc._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + i * 0.08 }}
                                            className="p-5 hover:bg-primary-50/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black border-2 border-white shadow-sm">{doc.fullName?.[0] || 'D'}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-black text-gray-900 text-sm">{doc.fullName}</h3>
                                                        <span className="text-[10px] font-bold text-gray-400">{doc.pmcNumber}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-bold text-primary-700">{doc.specialization}</span>
                                                        <span className="text-xs font-bold text-gray-400">{doc.experience} yrs exp</span>
                                                        <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                            <MapPin size={10} />
                                                            {doc.location}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleApprove(doc._id)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all active:scale-95">
                                                        <CheckCircle2 size={12} />
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleReject(doc._id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 transition-all active:scale-95">
                                                        <XCircle size={12} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Recent Appointments */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-black text-gray-900 font-display">Recent Appointments</h2>
                                    <Link to="/admin/appointments" className="text-xs font-black text-primary-700 uppercase tracking-widest hover:text-primary-800 flex items-center gap-1">
                                        View All <ChevronRight size={14} />
                                    </Link>
                                </div>

                                {/* Table Header */}
                                <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                    <span>Patient</span>
                                    <span>Doctor</span>
                                    <span>Date</span>
                                    <span>Time</span>
                                    <span>Fee</span>
                                    <span>Status</span>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {recentAppointments.length === 0 && <p className="p-6 text-center text-gray-400 font-bold">No appointments yet</p>}
                                    {recentAppointments.map((apt, i) => {
                                        const config = statusConfig[apt.status] || statusConfig.pending;
                                        return (
                                            <div key={apt._id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors text-sm">
                                                <span className="font-black text-gray-900 truncate">{apt.patient?.name || 'Patient'}</span>
                                                <span className="font-bold text-gray-600 truncate">{apt.doctor?.fullName || 'Doctor'}</span>
                                                <span className="font-bold text-gray-500">{new Date(apt.date).toLocaleDateString()}</span>
                                                <span className="font-bold text-gray-500">{apt.timeSlot}</span>
                                                <span className="font-black text-gray-900">Rs. {(apt.fee || 0).toLocaleString()}</span>
                                                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Revenue Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-6 text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px]" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-200">Total Revenue</p>
                                            <p className="text-3xl font-black mt-1">Rs. {((stats.totalRevenue || 0) / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                                            <DollarSign size={22} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Platform Fee</p>
                                            <p className="text-lg font-black">Rs. {((stats.platformFees || 0) / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Appointments</p>
                                            <p className="text-lg font-black">{stats.totalAppointments || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* User Management Quick View */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 font-display">Recent Patients</h3>
                                    <Link to="/admin/patients" className="text-xs font-black text-primary-700 uppercase tracking-widest">
                                        Manage
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {recentUsers.length === 0 && <p className="p-6 text-center text-gray-400 font-bold">No patients yet</p>}
                                    {recentUsers.map((u) => (
                                        <div key={u._id} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm border border-white shadow-sm">{u.name?.[0] || 'U'}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-900 truncate">{u.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${!u.isBlocked
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {u.isBlocked ? 'blocked' : 'active'}
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-gray-50 text-gray-500 border-gray-100">
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* System Health */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                            >
                                <h3 className="text-lg font-black text-gray-900 font-display mb-4">System Health</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Server Uptime', value: '99.9%', color: 'bg-emerald-500' },
                                        { label: 'API Response', value: '45ms', color: 'bg-primary-500' },
                                        { label: 'Database Load', value: '23%', color: 'bg-amber-500' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black text-gray-500">{item.label}</span>
                                                <span className="text-xs font-black text-gray-900">{item.value}</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }} />
                                            </div>
                                        </div>
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
                                        { icon: UserCheck, label: 'Review Approvals', path: '/admin/approvals', color: 'text-emerald-700' },
                                        { icon: Users, label: 'Manage Patients', path: '/admin/patients', color: 'text-primary-700' },
                                        { icon: Stethoscope, label: 'Manage Doctors', path: '/admin/doctors', color: 'text-primary-700' },
                                        { icon: BarChart3, label: 'View Reports', path: '/admin/reports', color: 'text-amber-600' },
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

export default AdminDashboard;
