import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Search, Settings, LogOut, Shield,
    CheckCircle2, UserCheck, BarChart3, CreditCard, LayoutDashboard,
    ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Wallet,
    RotateCcw, Clock, Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllPayments } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments', active: true },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminPayments = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getAllPayments();
                setPayments(data.payments || []);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'completed', label: 'Completed' },
        { key: 'pending', label: 'Pending' },
        { key: 'refunded', label: 'Refunded' },
    ];

    const filtered = payments.filter(p => {
        const matchesTab = activeTab === 'all' || p.status === activeTab;
        const patientName = p.patient?.name || p.patientName || '';
        const doctorName = p.doctor?.fullName || p.doctorName || '';
        const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctorName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalRefunds = payments.filter(p => p.status === 'refunded').reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.amount || 0), 0);

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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Payment & Refund Monitoring</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Track all payments and refund statuses</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Revenue Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { icon: Wallet, label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, change: '+22%', up: true, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: TrendingUp, label: 'This Month', value: `Rs. ${(totalRevenue * 0.35).toLocaleString()}`, change: '+15%', up: true, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { icon: RotateCcw, label: 'Total Refunds', value: `Rs. ${totalRefunds.toLocaleString()}`, change: `${payments.filter(p => p.status === 'refunded').length} refunds`, up: false, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                            { icon: Clock, label: 'Pending', value: `Rs. ${pendingAmount.toLocaleString()}`, change: `${payments.filter(p => p.status === 'pending').length} payments`, up: false, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
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
                                    <div className={`flex items-center gap-1 text-xs font-black ${stat.up ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {stat.up ? <ArrowUpRight size={12} /> : null}
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Revenue Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-3xl p-8 mb-10 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-[80px]" />
                        <div className="relative z-10 grid grid-cols-4 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Net Revenue</p>
                                <p className="text-3xl font-black mt-1">Rs. {(totalRevenue - totalRefunds).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Total Transactions</p>
                                <p className="text-3xl font-black mt-1">{payments.length}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Avg. Transaction</p>
                                <p className="text-3xl font-black mt-1">Rs. {payments.filter(p => p.status === 'completed').length > 0 ? Math.round(totalRevenue / payments.filter(p => p.status === 'completed').length).toLocaleString() : 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Refund Rate</p>
                                <p className="text-3xl font-black mt-1">{payments.length > 0 ? Math.round((payments.filter(p => p.status === 'refunded').length / payments.length) * 100) : 0}%</p>
                            </div>
                        </div>
                    </motion.div>

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
                                placeholder="Search payments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                            />
                        </div>
                    </div>

                    {/* Payments Table */}
                    <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <span className="col-span-2">Patient</span>
                            <span>Doctor</span>
                            <span>Date</span>
                            <span>Amount</span>
                            <span>Method</span>
                            <span>Status</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                            ) : filtered.map((payment, i) => (
                                <motion.div
                                    key={payment._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors"
                                >
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">{(payment.patient?.name || payment.patientName || 'P')[0]}</div>
                                        <span className="text-sm font-black text-gray-900 truncate">{payment.patient?.name || payment.patientName || 'Patient'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 truncate">{payment.doctor?.fullName || payment.doctorName || 'Doctor'}</span>
                                    <span className="text-sm font-bold text-gray-500">{new Date(payment.createdAt || payment.date).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1">
                                        {payment.status === 'refunded' ? (
                                            <ArrowDownRight size={14} className="text-red-500" />
                                        ) : payment.status === 'completed' ? (
                                            <ArrowUpRight size={14} className="text-emerald-600" />
                                        ) : null}
                                        <span className={`text-sm font-black ${payment.status === 'refunded' ? 'text-red-500' : 'text-gray-900'}`}>
                                            Rs. {(payment.amount || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 bg-[#635BFF] rounded flex items-center justify-center">
                                            <span className="text-white text-[8px] font-black">S</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">{payment.method}</span>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${payment.status === 'completed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : payment.status === 'pending'
                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                            : 'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {payment.status}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 mt-4">
                            <CreditCard size={48} className="text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No payments found</h3>
                            <p className="text-gray-500 font-bold">Try changing your filters or search query.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPayments;
