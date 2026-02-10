import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Search, Settings, LogOut, Shield,
    CheckCircle2, XCircle, Eye, UserCheck, Stethoscope, BarChart3,
    CreditCard, LayoutDashboard, Ban, RefreshCw, Mail, Phone,
    MapPin, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, blockUser, unblockUser } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Users, label: 'User Management', path: '/admin/users', active: true },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminUsers = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await getAllUsers();
            setUsers(data.users || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter;
        const matchesStatus = statusFilter === 'all' || (u.isBlocked ? 'blocked' : 'active') === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const toggleStatus = async (id, isBlocked) => {
        try {
            if (isBlocked) { await unblockUser(id); } else { await blockUser(id); }
            fetchUsers();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const totalPatients = users.filter(u => (u.role || '').toLowerCase() === 'patient').length;
    const totalDoctors = users.filter(u => (u.role || '').toLowerCase() === 'doctor').length;
    const blockedUsers = users.filter(u => u.isBlocked).length;

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
                            <p className="text-sm font-black text-gray-900 truncate">{authUser?.name || 'Admin'}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{authUser?.email}</p>
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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">User Management</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View and manage all platform users</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Total Users', value: users.length, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100', icon: Users },
                            { label: 'Patients', value: totalPatients, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Users },
                            { label: 'Doctors', value: totalDoctors, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100', icon: Stethoscope },
                            { label: 'Blocked', value: blockedUsers, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: Ban },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm shadow-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center border ${stat.border}`}>
                                        <stat.icon size={18} className={stat.color} />
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
                            {['all', 'patient', 'doctor'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${roleFilter === role
                                        ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {role === 'all' ? 'All Roles' : `${role}s`}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
                            {['all', 'active', 'blocked'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${statusFilter === status
                                        ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {status === 'all' ? 'All Status' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Table */}
                    <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <span className="col-span-2">User</span>
                            <span>Role</span>
                            <span>City</span>
                            <span>Joined</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                            ) : filtered.map((u, i) => (
                                <motion.div
                                    key={u._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors"
                                >
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm border border-white shadow-sm">{u.name?.[0] || 'U'}</div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-gray-900 truncate">{u.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 truncate">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${(u.role || '').toLowerCase() === 'doctor'
                                        ? 'bg-primary-50 text-primary-700 border-primary-100'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        }`}>
                                        {(u.role || '').toLowerCase() === 'doctor' && <Stethoscope size={10} />}
                                        {u.role}
                                    </span>
                                    <span className="text-sm font-bold text-gray-500">{u.city || '-'}</span>
                                    <span className="text-sm font-bold text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${!u.isBlocked
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {u.isBlocked ? 'blocked' : 'active'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleStatus(u._id, u.isBlocked)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${!u.isBlocked
                                                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {!u.isBlocked ? <Ban size={12} /> : <RefreshCw size={12} />}
                                            {!u.isBlocked ? 'Block' : 'Unblock'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 mt-4">
                            <Users size={48} className="text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No users found</h3>
                            <p className="text-gray-500 font-bold">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
