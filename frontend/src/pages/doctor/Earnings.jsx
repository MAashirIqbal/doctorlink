import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, User, Activity, LogOut,
    Users, Wallet, ClipboardList, Stethoscope, TrendingUp,
    DollarSign, ArrowUpRight, ArrowDownRight, CheckCircle2, MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyEarnings } from '../../api/doctorAPI';
import { resolveFileUrl } from '../../api/axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings', active: true },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const DoctorEarnings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('transactions');
    const [earnings, setEarnings] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [stats, setStats] = useState({ totalEarned: 0, monthEarnings: 0, totalCompleted: 0, pendingAmount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getMyEarnings();
                const payments = data.recentPayments || [];
                const monthly = data.monthlyEarnings || [];
                setEarnings(payments);
                setMonthlyData(monthly);

                const currentMonth = new Date().toISOString().slice(0, 7);
                const thisMonthData = monthly.find(m => m._id === currentMonth);
                const totalCompletedCount = monthly.reduce((sum, m) => sum + (m.count || 0), 0);

                setStats({
                    totalEarned: data.totalEarnings || 0,
                    monthEarnings: thisMonthData?.total || 0,
                    totalCompleted: totalCompletedCount,
                    pendingAmount: 0,
                });
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

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
                            <img src={resolveFileUrl(user.avatar)} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Earnings</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Track your revenue and payment history</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Earnings Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {[
                            { icon: Wallet, label: 'Total Earned', value: `Rs. ${(stats.totalEarned || 0).toLocaleString()}`, sub: 'Lifetime', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: TrendingUp, label: 'This Month', value: `Rs. ${(stats.monthEarnings || 0).toLocaleString()}`, sub: new Date().toLocaleString('en-US', { month: 'long' }), color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            { icon: CheckCircle2, label: 'Paid Appointments', value: String(stats.totalCompleted || 0), sub: 'Total', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                            { icon: DollarSign, label: 'Avg Per Appointment', value: stats.totalCompleted > 0 ? `Rs. ${Math.round((stats.totalEarned || 0) / stats.totalCompleted).toLocaleString()}` : 'Rs. 0', sub: 'Earning', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
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
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.sub}</span>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Earnings Breakdown Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-3xl p-8 mb-10 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-[80px]" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mb-2">Lifetime Earnings</p>
                            <p className="text-5xl font-black mb-6">Rs. {(stats.totalEarned || 0).toLocaleString()}</p>
                            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Total Appointments</p>
                                    <p className="text-2xl font-black mt-1">{stats.totalCompleted || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">This Month</p>
                                    <p className="text-2xl font-black mt-1">Rs. {((stats.monthEarnings || 0) / 1000).toFixed(0)}K</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Pending</p>
                                    <p className="text-2xl font-black mt-1">Rs. {(stats.pendingAmount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Monthly Earnings Chart */}
                    {monthlyData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 mb-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Monthly Earnings Trend</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-0.5">Revenue across months</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart
                                    data={[...monthlyData]
                                        .sort((a, b) => (a._id || '').localeCompare(b._id || ''))
                                        .map(m => {
                                            const [y, mo] = (m._id || '').split('-');
                                            const label = mo ? new Date(y, parseInt(mo) - 1).toLocaleString('en-US', { month: 'short' }) : m._id;
                                            return { month: label, earnings: m.total || 0, appts: m.count || 0 };
                                        })}
                                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} fontWeight={700} />
                                    <YAxis stroke="#9ca3af" fontSize={12} fontWeight={700} tickFormatter={(v) => `Rs.${v >= 1000 ? `${v / 1000}k` : v}`} />
                                    <Tooltip
                                        formatter={(v, name) => [name === 'earnings' ? `Rs. ${v.toLocaleString()}` : v, name === 'earnings' ? 'Earnings' : 'Appointments']}
                                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontWeight: 700 }}
                                    />
                                    <Line type="monotone" dataKey="earnings" stroke="#15803d" strokeWidth={3} dot={{ r: 4, fill: '#15803d' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 mb-8 w-fit">
                        {[
                            { key: 'transactions', label: 'Recent Transactions' },
                            { key: 'monthly', label: 'Monthly Breakdown' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.key
                                    ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden"
                        >
                            <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                <span>Patient</span>
                                <span>Date</span>
                                <span>Amount</span>
                                <span>Status</span>
                                <span></span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {earnings.length === 0 && <p className="p-8 text-center text-gray-400 font-bold">No transactions yet</p>}
                                {earnings.map((tx, i) => (
                                    <motion.div
                                        key={tx._id || i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xs border border-white shadow-sm">{tx.patient?.name?.[0] || 'P'}</div>
                                            <span className="text-sm font-black text-gray-900 truncate">{tx.patient?.name || 'Patient'}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                        <span className="text-sm font-black text-gray-900">Rs. {(tx.doctorEarning || tx.amount || 0).toLocaleString()}</span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${tx.status === 'completed'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : tx.status === 'pending'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {tx.status}
                                        </span>
                                        <div className="flex justify-end">
                                            {tx.status === 'completed' && (
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <ArrowUpRight size={14} />
                                                    <span className="text-xs font-black">+Rs. {(tx.doctorEarning || tx.amount || 0).toLocaleString()}</span>
                                                </span>
                                            )}
                                            {tx.status === 'refunded' && (
                                                <span className="flex items-center gap-1 text-red-500">
                                                    <ArrowDownRight size={14} />
                                                    <span className="text-xs font-black">-Rs. {(tx.amount || 0).toLocaleString()}</span>
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Monthly Breakdown Tab */}
                    {activeTab === 'monthly' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {monthlyData.length === 0 && <p className="text-center py-12 text-gray-400 font-bold">No monthly data yet</p>}
                            {monthlyData.map((month, i) => {
                                const maxEarning = Math.max(...monthlyData.map(m => m.total || 0), 1);
                                const [year, mon] = (month._id || '').split('-');
                                const monthLabel = mon ? new Date(year, parseInt(mon) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : month._id;
                                return (
                                    <div key={month._id || i} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">{monthLabel}</h3>
                                                <p className="text-sm font-bold text-gray-400 mt-0.5">{month.count || 0} appointment{(month.count || 0) !== 1 ? 's' : ''}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-emerald-700">Rs. {(month.total || 0).toLocaleString()}</p>
                                                <p className="text-xs font-black text-gray-400 mt-1">Avg Rs. {month.count > 0 ? Math.round(month.total / month.count).toLocaleString() : 0}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(((month.total || 0) / maxEarning) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DoctorEarnings;
