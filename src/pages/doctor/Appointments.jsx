import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Search, Activity, LogOut,
    Users, Wallet, ClipboardList, Stethoscope, CheckCircle2,
    XCircle, AlertCircle, Eye, ChevronRight, Filter, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorAppointments, acceptAppointment, rejectAppointment, completeAppointment } from '../../api/appointmentAPI';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments', active: true },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertCircle, label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle, label: 'Cancelled' },
};

const DoctorAppointments = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const params = activeTab !== 'all' ? { status: activeTab } : {};
            const { data } = await getDoctorAppointments(params);
            setAppointments(data.appointments || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, [activeTab]);

    const handleAccept = async (id) => { try { await acceptAppointment(id); fetchAppointments(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleReject = async (id) => { try { await rejectAppointment(id); fetchAppointments(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleComplete = async (id) => { try { await completeAppointment(id); fetchAppointments(); } catch(e) { alert(e.response?.data?.message || 'Failed'); } };
    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    const filtered = appointments.filter(apt => {
        const matchesSearch = (apt.patient?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Appointments</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Manage and review all patient appointments</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Summary Stats */}
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
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                            />
                        </div>
                    </div>

                    {/* Appointment Cards */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                        ) : filtered.map((apt, i) => {
                            const config = statusConfig[apt.status] || statusConfig.pending;
                            return (
                                <motion.div
                                    key={apt._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row items-start gap-5">
                                        {apt.patient?.avatar ? (
                                            <img src={apt.patient.avatar} alt={apt.patient?.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg border-2 border-white shadow-md">{apt.patient?.name?.[0] || 'P'}</div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900">{apt.patient?.name || 'Patient'}</h3>
                                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mt-0.5">
                                                        <span className="text-primary-600">{apt.patient?.email}</span>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
                                                    <config.icon size={12} />
                                                    {config.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500 mb-4">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-primary-600" />
                                                    {new Date(apt.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-primary-600" />
                                                    {apt.timeSlot}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee</span>
                                                        <p className="text-lg font-black text-gray-900">Rs. {(apt.fee || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</span>
                                                        <p className={`text-sm font-black mt-0.5 ${apt.paymentStatus === 'paid' ? 'text-emerald-600' : apt.paymentStatus === 'refunded' ? 'text-blue-600' : 'text-amber-600'}`}>
                                                            {apt.paymentStatus === 'paid' ? 'Paid' : apt.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleAccept(apt._id)} className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all active:scale-95">
                                                                <CheckCircle2 size={14} />
                                                                Accept
                                                            </button>
                                                            <button onClick={() => handleReject(apt._id)} className="flex items-center gap-1.5 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 transition-all active:scale-95">
                                                                <XCircle size={14} />
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button onClick={() => handleComplete(apt._id)} className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-xl text-xs font-black hover:bg-primary-100 transition-all active:scale-95">
                                                            <CheckCircle2 size={14} />
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50">
                                <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No appointments found</h3>
                                <p className="text-gray-500 font-bold">Try changing your filters or search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorAppointments;
