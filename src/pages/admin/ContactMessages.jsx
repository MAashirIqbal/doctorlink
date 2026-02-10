import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, LayoutDashboard, UserCheck, Users, Calendar, CreditCard, BarChart3,
    Settings, Shield, LogOut, Mail, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getContactMessages, markContactMessageRead } from '../../api/contactAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages', active: true },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const ContactMessages = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const fetch = async () => {
        setLoading(true);
        try {
            const params = activeTab !== 'all' ? { status: activeTab } : {};
            const { data } = await getContactMessages(params);
            setMessages(data.messages || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, [activeTab]);

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const handleMarkRead = async (id) => {
        try {
            await markContactMessageRead(id);
            fetch();
        } catch (e) {
            alert(e.response?.data?.message || 'Failed');
        }
    };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'new', label: 'New' },
        { key: 'read', label: 'Read' },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
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

            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Contact Messages</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Read and manage messages from the public contact form</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 mb-8 w-fit">
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

                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={m._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={`bg-white rounded-2xl border shadow-sm p-6 ${m.status === 'new' ? 'border-amber-200/70' : 'border-gray-200/60'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-gray-900 truncate">{m.subject}</p>
                                            <p className="text-xs font-bold text-gray-500 mt-1">{m.name} • {m.email} • {new Date(m.createdAt).toLocaleString()}</p>
                                            <p className="text-sm font-bold text-gray-700 mt-4 whitespace-pre-wrap">{m.message}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${m.status === 'new'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                }`}
                                            >
                                                {m.status}
                                            </span>
                                            {m.status === 'new' && (
                                                <button
                                                    onClick={() => handleMarkRead(m._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {messages.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm">
                                    <Mail size={48} className="text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No messages</h3>
                                    <p className="text-gray-500 font-bold">Nothing to show for this filter.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ContactMessages;
