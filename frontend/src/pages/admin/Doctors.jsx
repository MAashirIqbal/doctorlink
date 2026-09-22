import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Search, Settings, LogOut, Shield,
    CheckCircle2, XCircle, Eye, UserCheck, Stethoscope, BarChart3,
    CreditCard, LayoutDashboard, AlertCircle, Mail, MapPin,
    Megaphone, Heart, Star, Briefcase, Database, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAllDoctors, scrapeDoctors } from '../../api/adminAPI';
import { resolveFileUrl } from '../../api/axios';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Heart, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors', active: true },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const statusConfig = {
    approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Approved' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Pending' },
    rejected: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Rejected' },
};

const AdminDoctors = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scraping, setScraping] = useState(false);
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [showScraper, setShowScraper] = useState(false);

    const handleScrape = async () => {
        setScraping(true);
        try {
            const { data } = await scrapeDoctors({ url: scrapeUrl || undefined, autoApprove: false });
            toast.success(`Ingested ${data.inserted} new, skipped ${data.skipped} duplicates${data.fetchError ? ' (used built-in sample)' : ''}`);
            setShowScraper(false);
            setScrapeUrl('');
            await fetchDoctors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Scrape failed');
        }
        setScraping(false);
    };

    const fetchDoctors = async () => {
        try {
            const { data } = await getAllDoctors();
            setDoctors(data.doctors || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchDoctors(); }, []);

    const filtered = doctors.filter(d => {
        const matchesSearch = (d.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const approvedCount = doctors.filter(d => d.status === 'approved').length;
    const pendingCount = doctors.filter(d => d.status === 'pending').length;
    const rejectedCount = doctors.filter(d => d.status === 'rejected').length;

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
                <div className="p-6 border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-primary-700 p-2 rounded-xl shadow-sm"><Activity className="text-white w-5 h-5" /></div>
                        <span className="text-xl font-black tracking-tight font-display text-gray-900">Doctor<span className="text-primary-700">Link</span></span>
                    </Link>
                    <div className="mt-4 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100 inline-flex items-center gap-1.5">
                        <Shield size={12} className="text-red-600" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Admin Panel</span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link, i) => (
                        <Link key={i} to={link.path} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${link.active ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <link.icon size={18} />{link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center"><Shield size={18} className="text-white" /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{authUser?.name || 'Admin'}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{authUser?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors" /></button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Doctor Management</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View and manage all doctors on the platform</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowScraper(!showScraper)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-sm">
                                <Database size={14} />
                                Ingest from Directory
                            </button>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input type="text" placeholder="Search doctors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all" />
                            </div>
                        </div>
                    </div>
                    {showScraper && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                            <Sparkles size={16} className="text-blue-600 flex-shrink-0" />
                            <input type="url" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)}
                                placeholder="Paste a directory URL — or leave blank to use the built-in sample"
                                className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-400" />
                            <button onClick={handleScrape} disabled={scraping}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50">
                                {scraping ? 'Ingesting...' : 'Run Scrape'}
                            </button>
                        </div>
                    )}
                </header>

                <div className="p-8">
                    <div className="grid grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Total Doctors', value: doctors.length, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100', icon: Stethoscope },
                            { label: 'Approved', value: approvedCount, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
                            { label: 'Pending', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle },
                            { label: 'Rejected', value: rejectedCount, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle },
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
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

                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
                            {['all', 'approved', 'pending', 'rejected'].map(status => (
                                <button key={status} onClick={() => setStatusFilter(status)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${statusFilter === status ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                    {status === 'all' ? 'All Doctors' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                        <div className="grid grid-cols-8 gap-3 px-6 py-3 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <span className="col-span-2">Doctor</span>
                            <span>Specialization</span>
                            <span>Location</span>
                            <span>Fee</span>
                            <span>Rating</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                            ) : filtered.map((d, i) => {
                                const config = statusConfig[d.status] || statusConfig.pending;
                                return (
                                    <motion.div key={d._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="grid grid-cols-8 gap-3 px-6 py-4 items-center hover:bg-gray-50/30 transition-colors">
                                        <div className="col-span-2 flex items-center gap-3">
                                            {d.avatar ? (
                                                <img src={resolveFileUrl(d.avatar)} alt={d.fullName} className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm border border-white shadow-sm">{d.fullName?.[0] || 'D'}</div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-gray-900 truncate">{d.fullName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 truncate">{d.user?.email || '-'}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-600">{d.specialization}</span>
                                        <span className="text-sm font-bold text-gray-500 flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{d.location || '-'}</span>
                                        <span className="text-sm font-black text-gray-900">Rs. {(d.fee || 0).toLocaleString()}</span>
                                        <span className="text-sm font-bold text-gray-600 flex items-center gap-1">
                                            <Star size={12} className="text-amber-400 fill-amber-400" />
                                            {d.rating ? d.rating.toFixed(1) : '-'}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${config.color}`}>
                                            {config.label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/admin/doctors/${d._id}`}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100 transition-all active:scale-95">
                                                <Eye size={12} /> Details
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {filtered.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 mt-4">
                            <Stethoscope size={48} className="text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No doctors found</h3>
                            <p className="text-gray-500 font-bold">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDoctors;
