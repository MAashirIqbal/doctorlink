import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Search, Settings, LogOut, Shield,
    CheckCircle2, XCircle, AlertCircle, Eye, UserCheck, Stethoscope,
    BarChart3, CreditCard, LayoutDashboard, Clock, MapPin, ChevronDown, Mail,
    Bell, Heart, Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllAppointments, overrideAppointmentStatus } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Heart, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments', active: true },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Cancelled' },
    'no-show': { color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'No-Show' },
    rescheduling: { color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Rescheduling' },
    expired: { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Expired' },
};

const AdminAppointments = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const { data } = await getAllAppointments();
            setAppointments(data.appointments || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, []);

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'completed', label: 'Completed' },
        { key: 'no-show', label: 'No-Show' },
        { key: 'rescheduling', label: 'Rescheduling' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    const filtered = appointments.filter(apt => {
        const matchesTab = activeTab === 'all' || apt.status === activeTab;
        const patientName = apt.patient?.name || '';
        const doctorName = apt.doctor?.fullName || '';
        const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctorName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleOverrideStatus = async (id, newStatus) => {
        try {
            await overrideAppointmentStatus(id, { status: newStatus });
            fetchAppointments();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
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
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Appointment Management</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View and manage all platform appointments</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                        ].map((stat, i) => (
                            <div key={i} className={`${stat.bg} rounded-2xl p-5 border ${stat.border}`}>
                                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs & Search */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.key
                                        ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                            />
                        </div>
                    </div>

                    {/* Appointments Table */}
                    <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                        <div className="grid grid-cols-8 gap-3 px-6 py-3 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <span className="col-span-2">Patient</span>
                            <span className="col-span-2">Doctor</span>
                            <span>Date & Time</span>
                            <span>Fee</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                            ) : filtered.map((apt, i) => {
                                const config = statusConfig[apt.status] || statusConfig.pending;
                                return (
                                    <motion.div
                                        key={apt._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="grid grid-cols-8 gap-3 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors"
                                    >
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">{apt.patient?.name?.[0] || 'P'}</div>
                                            <span className="text-sm font-black text-gray-900 truncate">{apt.patient?.name || 'Patient'}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xs">{apt.doctor?.fullName?.[0] || 'D'}</div>
                                            <div className="min-w-0">
                                                <span className="text-sm font-black text-gray-900 truncate block">{apt.doctor?.fullName || 'Doctor'}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{apt.doctor?.specialization}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{new Date(apt.date).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{apt.timeSlot}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">Rs. {(apt.fee || 0).toLocaleString()}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${apt.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {apt.paymentStatus || 'pending'}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${config.color}`}>
                                            {config.label}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Link to={`/admin/appointments/${apt._id}`}
                                                className="p-2 bg-primary-50 text-primary-700 border border-primary-100 rounded-xl hover:bg-primary-100 transition-all active:scale-95"
                                                title="View Details">
                                                <Eye size={13} />
                                            </Link>
                                            {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                                <button
                                                    onClick={() => handleOverrideStatus(apt._id, 'cancelled')}
                                                    className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                                    title="Cancel"
                                                >
                                                    <XCircle size={13} />
                                                </button>
                                            )}
                                            {apt.status === 'pending' && (
                                                <button
                                                    onClick={() => handleOverrideStatus(apt._id, 'confirmed')}
                                                    className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all active:scale-95"
                                                    title="Confirm"
                                                >
                                                    <CheckCircle2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 mt-4">
                            <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No appointments found</h3>
                            <p className="text-gray-500 font-bold">Try changing your filters or search query.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminAppointments;
