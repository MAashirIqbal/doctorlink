import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import {
    Activity, Calendar, Settings, LogOut, Shield,
    CheckCircle2, XCircle, UserCheck, Stethoscope, BarChart3,
    CreditCard, LayoutDashboard, Mail, Megaphone, Heart,
    Plus, Trash2, Edit3, AlertTriangle, Info, AlertCircle,
    X, Users, Eye, EyeOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Heart, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements', active: true },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const typeConfig = {
    info: { icon: Info, color: 'bg-blue-50 text-blue-700 border-blue-100', badge: 'bg-blue-100 text-blue-700' },
    warning: { icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-100', badge: 'bg-amber-100 text-amber-700' },
    critical: { icon: AlertCircle, color: 'bg-red-50 text-red-600 border-red-100', badge: 'bg-red-100 text-red-600' },
    success: { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
};

const AdminAnnouncements = () => {
    const { user: authUser, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '', message: '', type: 'info', audience: 'all',
        isDismissible: true, isActive: true, expiresAt: '',
    });
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchAnnouncements = async () => {
        try {
            const { data } = await getAnnouncements();
            setAnnouncements(data.announcements || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const resetForm = () => {
        setForm({ title: '', message: '', type: 'info', audience: 'all', isDismissible: true, isActive: true, expiresAt: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (a) => {
        setForm({
            title: a.title, message: a.message, type: a.type, audience: a.audience,
            isDismissible: a.isDismissible, isActive: a.isActive,
            expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '',
        });
        setEditingId(a._id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.message) return toast.warning('Title and message are required');
        setSaving(true);
        try {
            const payload = { ...form, expiresAt: form.expiresAt || null };
            if (editingId) {
                await updateAnnouncement(editingId, payload);
            } else {
                await createAnnouncement(payload);
            }
            resetForm();
            fetchAnnouncements();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try { await deleteAnnouncement(id); fetchAnnouncements(); } catch (e) { toast.error('Failed to delete'); }
    };

    const handleToggleActive = async (a) => {
        try {
            await updateAnnouncement(a._id, { isActive: !a.isActive });
            fetchAnnouncements();
        } catch (e) { toast.error('Failed to update'); }
    };

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const filtered = announcements.filter(a => {
        if (filter === 'global') return !a.targetUser;
        if (filter === 'individual') return !!a.targetUser;
        if (filter === 'active') return a.isActive;
        if (filter === 'inactive') return !a.isActive;
        return true;
    });

    const globalCount = announcements.filter(a => !a.targetUser).length;
    const individualCount = announcements.filter(a => !!a.targetUser).length;
    const activeCount = announcements.filter(a => a.isActive).length;

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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Announcements</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Manage global and individual announcements</p>
                        </div>
                        <button onClick={() => { resetForm(); setShowForm(true); }}
                            className="flex items-center gap-2 px-5 py-3 bg-primary-700 text-white rounded-2xl font-black text-sm hover:bg-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-700/20">
                            <Plus size={16} /> New Announcement
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Total', value: announcements.length, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100', icon: Megaphone },
                            { label: 'Global', value: globalCount, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: Users },
                            { label: 'Individual', value: individualCount, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100', icon: Mail },
                            { label: 'Active', value: activeCount, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
                                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center border ${stat.border} mb-2`}>
                                    <stat.icon size={18} className={stat.color} />
                                </div>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 w-fit mb-8">
                        {['all', 'global', 'individual', 'active', 'inactive'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${filter === f ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Create/Edit Form Modal */}
                    {showForm && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-200/60 shadow-lg shadow-gray-200/50 p-8 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-900 font-display">{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
                                <button onClick={resetForm} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"><X size={18} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Title</label>
                                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 transition-all" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Message</label>
                                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Announcement message..." rows={3}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 transition-all resize-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Type</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200 transition-all">
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="critical">Critical</option>
                                        <option value="success">Success</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Audience</label>
                                    <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200 transition-all">
                                        <option value="all">All (Patients + Doctors)</option>
                                        <option value="patients">Patients Only</option>
                                        <option value="doctors">Doctors Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Expires At (optional)</label>
                                    <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200 transition-all" />
                                </div>
                                <div className="flex items-end gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.isDismissible} onChange={(e) => setForm({ ...form, isDismissible: e.target.checked })} className="rounded border-gray-300 text-primary-700 focus:ring-primary-500" />
                                        <span className="text-sm font-black text-gray-700">Dismissible</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-300 text-primary-700 focus:ring-primary-500" />
                                        <span className="text-sm font-black text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                                <button onClick={resetForm} className="px-5 py-3 bg-gray-50 text-gray-600 rounded-xl text-sm font-black hover:bg-gray-100 transition-all">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-xl text-sm font-black hover:bg-primary-800 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary-700/20">
                                    {saving ? 'Saving...' : (editingId ? 'Update Announcement' : 'Create Announcement')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Announcements List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50">
                                <Megaphone size={48} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No announcements found</h3>
                                <p className="text-gray-500 font-bold">Create your first announcement to get started.</p>
                            </div>
                        ) : filtered.map((a, i) => {
                            const tc = typeConfig[a.type] || typeConfig.info;
                            const TypeIcon = tc.icon;
                            return (
                                <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                    className={`bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-5 ${!a.isActive ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${tc.color}`}>
                                                <TypeIcon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="text-sm font-black text-gray-900">{a.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tc.badge}`}>{a.type}</span>
                                                    {a.targetUser ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-700">
                                                            Individual — {a.targetUser.name || a.targetUser.email}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                                                            {a.audience === 'all' ? 'All' : a.audience === 'patients' ? 'Patients' : 'Doctors'}
                                                        </span>
                                                    )}
                                                    {!a.isDismissible && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500">Persistent</span>}
                                                    {!a.isActive && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">Inactive</span>}
                                                </div>
                                                <p className="text-xs font-bold text-gray-500 line-clamp-2">{a.message}</p>
                                                <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-gray-400">
                                                    <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
                                                    {a.createdBy?.name && <span>by {a.createdBy.name}</span>}
                                                    {a.expiresAt && <span>Expires {new Date(a.expiresAt).toLocaleDateString()}</span>}
                                                    {a.dismissedBy?.length > 0 && <span>{a.dismissedBy.length} dismissed</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button onClick={() => handleToggleActive(a)} title={a.isActive ? 'Deactivate' : 'Activate'}
                                                className={`p-2 rounded-lg transition-all ${a.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                                {a.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            {!a.targetUser && (
                                                <button onClick={() => handleEdit(a)} className="p-2 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50 transition-all">
                                                    <Edit3 size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(a._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAnnouncements;
