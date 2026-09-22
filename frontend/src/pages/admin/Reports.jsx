import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, Shield,
    UserCheck, BarChart3, CreditCard, LayoutDashboard,
    TrendingUp, ArrowUpRight, Star, Stethoscope, DollarSign,
    Clock, CheckCircle2, MapPin, Mail, Heart, Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getReports } from '../../api/adminAPI';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Heart, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports', active: true },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminReports = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [platformStats, setPlatformStats] = useState({ totalUsers: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0, avgRating: 0, completionRate: 0 });
    const [topDoctors, setTopDoctors] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [topSpecializations, setTopSpecializations] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getReports();
                if (data.platformStats) setPlatformStats(data.platformStats);
                if (data.topDoctors) setTopDoctors(data.topDoctors);
                if (data.monthlyGrowth) {
                    // Merge monthly arrays into unified data
                    const months = {};
                    (data.monthlyGrowth.monthlyUsers || []).forEach(m => { months[m._id] = { ...months[m._id], month: m._id, users: m.count }; });
                    (data.monthlyGrowth.monthlyAppointments || []).forEach(m => { months[m._id] = { ...months[m._id], month: m._id, appointments: m.count }; });
                    (data.monthlyGrowth.monthlyRevenue || []).forEach(m => { months[m._id] = { ...months[m._id], month: m._id, revenue: m.total }; });
                    setMonthlyData(Object.values(months).sort((a, b) => a.month.localeCompare(b.month)));
                }
                if (data.specDistribution) {
                    const totalDocs = data.specDistribution.reduce((s, d) => s + d.count, 0);
                    setTopSpecializations(data.specDistribution.map(d => ({
                        name: d._id,
                        count: d.count,
                        percentage: totalDocs > 0 ? Math.round((d.count / totalDocs) * 100) : 0,
                    })));
                }
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Reports & Analytics</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Platform usage statistics and doctor performance</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Tabs */}
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 mb-10 w-fit">
                        {[
                            { key: 'overview', label: 'Platform Overview' },
                            { key: 'doctors', label: 'Doctor Performance' },
                            { key: 'growth', label: 'Growth Trends' },
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

                    {/* Platform Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { icon: Users, label: 'Total Users', value: (platformStats.totalUsers || 0).toLocaleString(), change: '', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                                    { icon: Stethoscope, label: 'Active Doctors', value: (platformStats.totalDoctors || platformStats.activeDoctors || 0).toLocaleString(), change: '', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                    { icon: Calendar, label: 'Total Appointments', value: (platformStats.totalAppointments || 0).toLocaleString(), change: '', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                    { icon: DollarSign, label: 'Total Revenue', value: `Rs. ${((platformStats.totalRevenue || 0) / 1000).toFixed(0)}K`, change: '', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100' },
                                    { icon: Star, label: 'Avg. Doctor Rating', value: (platformStats.avgRating || 0).toString(), change: 'out of 5.0', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                    { icon: CheckCircle2, label: 'Completion Rate', value: `${platformStats.completionRate || 0}%`, change: 'appointments', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm shadow-gray-200/50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center border ${stat.border}`}>
                                                <stat.icon size={22} className={stat.color} />
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-black text-emerald-600">
                                                <ArrowUpRight size={12} />
                                                {stat.change}
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Specialization Distribution */}
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-6">Doctor Specialization Distribution</h3>
                                <div className="space-y-4">
                                    {topSpecializations.map((spec, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-black text-gray-700">{spec.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-gray-400">{spec.count} doctors</span>
                                                    <span className="text-sm font-black text-primary-700">{spec.percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${spec.percentage * 4}%` }}
                                                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                                                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Doctor Performance Tab */}
                    {activeTab === 'doctors' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <h3 className="text-lg font-black text-gray-900 font-display">Top Performing Doctors</h3>
                            <div className="space-y-4">
                                {topDoctors.length === 0 && <p className="text-center text-gray-400 font-bold py-10">No doctor data available yet</p>}
                                {topDoctors.map((doc, i) => (
                                    <motion.div
                                        key={doc._id || i}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-xl border border-primary-100 text-primary-700 font-black text-lg">
                                                #{i + 1}
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl border-2 border-white shadow-md">{(doc.fullName || doc.name || 'D')[0]}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-black text-gray-900">{doc.fullName || doc.name}</h4>
                                                <p className="text-sm font-bold text-primary-700">{doc.specialization}</p>
                                            </div>
                                            <div className="grid grid-cols-4 gap-8 text-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patients</p>
                                                    <p className="text-lg font-black text-gray-900">{(doc.patients || 0).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointments</p>
                                                    <p className="text-lg font-black text-gray-900">{doc.appointments || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p>
                                                    <p className="text-lg font-black text-emerald-700">Rs. {((doc.revenue || 0) / 1000).toFixed(0)}K</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                                        <p className="text-lg font-black text-gray-900">{doc.rating || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Growth Trends Tab */}
                    {activeTab === 'growth' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <h3 className="text-lg font-black text-gray-900 font-display">Monthly Growth Trends</h3>

                            {/* Chart: revenue (bars) + appointments (line) */}
                            {monthlyData.length > 0 && (
                                <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                    <div className="mb-4">
                                        <h4 className="text-base font-black text-gray-900">Revenue & Appointments</h4>
                                        <p className="text-xs font-bold text-gray-400 mt-0.5">Monthly trend across the platform</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart
                                            data={monthlyData.map(m => {
                                                const [y, mo] = (m.month || '').split('-');
                                                const label = mo ? new Date(y, parseInt(mo) - 1).toLocaleString('en-US', { month: 'short' }) : m.month;
                                                return { month: label, revenue: m.revenue || 0, appointments: m.appointments || 0 };
                                            })}
                                            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} fontWeight={700} />
                                            <YAxis yAxisId="left" stroke="#15803d" fontSize={12} fontWeight={700} tickFormatter={(v) => `Rs.${v >= 1000 ? `${v / 1000}k` : v}`} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={12} fontWeight={700} />
                                            <Tooltip
                                                formatter={(v, name) => name === 'revenue' ? [`Rs. ${v.toLocaleString()}`, 'Revenue'] : [v, 'Appointments']}
                                                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontWeight: 700 }}
                                            />
                                            <Legend wrapperStyle={{ fontWeight: 700, fontSize: 12 }} />
                                            <Bar yAxisId="left" dataKey="revenue" fill="#15803d" radius={[8, 8, 0, 0]} />
                                            <Line yAxisId="right" type="monotone" dataKey="appointments" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706' }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Monthly Breakdown Cards */}
                            <div className="space-y-4">
                                {monthlyData.length === 0 && <p className="text-center text-gray-400 font-bold py-10">No growth data available yet</p>}
                                {monthlyData.map((entry, i) => {
                                    const prevEntry = i > 0 ? monthlyData[i - 1] : null;
                                    const users = entry.users || 0;
                                    const revenue = entry.revenue || 0;
                                    const appointments = entry.appointments || 0;
                                    const prevUsers = prevEntry?.users || 0;
                                    const prevRevenue = prevEntry?.revenue || 0;
                                    const userGrowth = prevEntry && prevUsers > 0 ? (((users - prevUsers) / prevUsers) * 100).toFixed(1) : '—';
                                    const revenueGrowth = prevEntry && prevRevenue > 0 ? (((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : '—';

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
                                                        <Calendar size={20} className="text-primary-700" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900">{entry.month}</h4>
                                                        <p className="text-xs font-bold text-gray-400">{appointments} appointments</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-10 text-right">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Users</p>
                                                        <p className="text-lg font-black text-gray-900">{users.toLocaleString()}</p>
                                                        {prevEntry && userGrowth !== '—' && (
                                                            <p className={`text-[10px] font-black ${Number(userGrowth) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {Number(userGrowth) >= 0 ? '+' : ''}{userGrowth}%
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</p>
                                                        <p className="text-lg font-black text-emerald-700">Rs. {(revenue / 1000).toFixed(0)}K</p>
                                                        {prevEntry && revenueGrowth !== '—' && (
                                                            <p className={`text-[10px] font-black ${Number(revenueGrowth) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {Number(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}%
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointments</p>
                                                        <p className="text-lg font-black text-gray-900">{appointments.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full"
                                                    style={{ width: `${Math.min((revenue / 500000) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminReports;
