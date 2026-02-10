import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, Shield,
    CheckCircle2, XCircle, Eye, UserCheck, Stethoscope, BarChart3,
    CreditCard, LayoutDashboard, Ban, RefreshCw, Mail, Phone,
    MapPin, ArrowLeft, Lock, Megaphone, Heart, Clock, Send,
    AlertCircle, DollarSign, Star, Briefcase, FileText,
    ShieldCheck, GraduationCap, Search
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDetail, approveDoctor, rejectDoctor, editDoctor, blockUser, unblockUser, resetUserPassword, createAnnouncement } from '../../api/adminAPI';

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

const aptStatusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Cancelled' },
    'no-show': { color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'No-Show' },
    rescheduling: { color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Rescheduling' },
    expired: { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Expired' },
};

const docStatusConfig = {
    approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Approved' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Pending Review' },
    rejected: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Rejected' },
};

const AdminDoctorDetail = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [actionLoading, setActionLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', type: 'info' });
    const [announcementLoading, setAnnouncementLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await getDoctorDetail(id);
            setData(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleApprove = async () => {
        setActionLoading(true);
        try { await approveDoctor(id); fetchData(); } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject this doctor?')) return;
        setActionLoading(true);
        try { await rejectDoctor(id); fetchData(); } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleToggleBlock = async () => {
        const doc = data?.doctor;
        if (!doc?.user?._id) return;
        const action = doc.user.isBlocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this doctor's account?`)) return;
        try {
            if (doc.user.isBlocked) { await unblockUser(doc.user._id); } else { await blockUser(doc.user._id); }
            fetchData();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters');
        const userId = data?.doctor?.user?._id;
        if (!userId) return;
        setPasswordLoading(true);
        try {
            await resetUserPassword(userId, { newPassword });
            setNewPassword('');
            alert('Password reset successfully');
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        setPasswordLoading(false);
    };

    const handleSendAnnouncement = async () => {
        if (!announcementForm.title || !announcementForm.message) return alert('Title and message are required');
        const userId = data?.doctor?.user?._id;
        if (!userId) return;
        setAnnouncementLoading(true);
        try {
            await createAnnouncement({ ...announcementForm, targetUser: userId });
            setAnnouncementForm({ title: '', message: '', type: 'info' });
            fetchData();
            alert('Announcement sent');
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        setAnnouncementLoading(false);
    };

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };
    const doctor = data?.doctor;
    const dStatus = docStatusConfig[doctor?.status] || docStatusConfig.pending;

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
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/doctors')} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Doctor Details</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View and manage doctor profile and account</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                    ) : !doctor ? (
                        <div className="text-center py-20"><p className="text-gray-400 font-bold">Doctor not found</p></div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Profile Card */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                    <div className="flex items-start gap-5">
                                        {doctor.avatar ? (
                                            <img src={doctor.avatar} alt={doctor.fullName} className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-2xl border-2 border-white shadow-md">{doctor.fullName?.[0] || 'D'}</div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <h2 className="text-xl font-black text-gray-900 font-display">{doctor.fullName}</h2>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${dStatus.color}`}>{dStatus.label}</span>
                                                {doctor.user?.isBlocked && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-50 text-red-600 border-red-100">Account Blocked</span>}
                                            </div>
                                            <p className="text-sm font-bold text-primary-700">{doctor.specialization}</p>
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                {[
                                                    { icon: Mail, value: doctor.user?.email },
                                                    { icon: Phone, value: doctor.user?.phone || doctor.phone },
                                                    { icon: MapPin, value: doctor.location },
                                                    { icon: ShieldCheck, value: `PMC: ${doctor.pmcNumber}` },
                                                    { icon: GraduationCap, value: doctor.degree },
                                                    { icon: Briefcase, value: `${doctor.experience} yrs experience` },
                                                    { icon: DollarSign, value: `Fee: Rs. ${(doctor.fee || 0).toLocaleString()}` },
                                                    { icon: Star, value: `Rating: ${doctor.rating ? doctor.rating.toFixed(1) : 'N/A'} (${doctor.totalReviews || 0} reviews)` },
                                                    { icon: FileText, value: `CNIC: ${doctor.cnic || 'N/A'}` },
                                                    { icon: Clock, value: `Joined ${new Date(doctor.createdAt).toLocaleDateString()}` },
                                                ].filter(item => item.value).map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <item.icon size={13} className="text-gray-400 flex-shrink-0" />
                                                        <span className="font-bold truncate">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {doctor.about && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">About</p>
                                                    <p className="text-xs font-bold text-gray-600 leading-relaxed">{doctor.about}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Approval Actions */}
                                    {doctor.status === 'pending' && (
                                        <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
                                            <button onClick={handleApprove} disabled={actionLoading}
                                                className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-600/20">
                                                <CheckCircle2 size={16} /> Approve Doctor
                                            </button>
                                            <button onClick={handleReject} disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-sm hover:bg-red-100 transition-all disabled:opacity-50 active:scale-95">
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    )}
                                    {doctor.status === 'rejected' && (
                                        <div className="mt-5 pt-5 border-t border-gray-100">
                                            <button onClick={handleApprove} disabled={actionLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-600/20">
                                                <CheckCircle2 size={16} /> Re-Approve Doctor
                                            </button>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Tabs */}
                                <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 w-fit">
                                    {[{ key: 'profile', label: 'Appointments' }, { key: 'reviews', label: 'Reviews' }, { key: 'actions', label: 'Admin Actions' }].map(tab => (
                                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.key ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Appointments Tab */}
                                {activeTab === 'profile' && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100"><h3 className="text-sm font-black text-gray-900">Recent Appointments</h3></div>
                                        <div className="divide-y divide-gray-50">
                                            {(data.appointments || []).length === 0 && <p className="p-6 text-center text-gray-400 font-bold">No appointments yet</p>}
                                            {(data.appointments || []).map((apt) => {
                                                const config = aptStatusConfig[apt.status] || aptStatusConfig.pending;
                                                return (
                                                    <Link key={apt._id} to={`/admin/appointments/${apt._id}`} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">{apt.patient?.name?.[0] || 'P'}</div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900">{apt.patient?.name || 'Patient'}</p>
                                                                <p className="text-[10px] font-bold text-gray-400">{new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black text-gray-700">Rs. {(apt.fee || 0).toLocaleString()}</span>
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>{config.label}</span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === 'reviews' && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100"><h3 className="text-sm font-black text-gray-900">Patient Reviews</h3></div>
                                        <div className="divide-y divide-gray-50">
                                            {(data.reviews || []).length === 0 && <p className="p-6 text-center text-gray-400 font-bold">No reviews yet</p>}
                                            {(data.reviews || []).map((r) => (
                                                <div key={r._id} className="p-4">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-black text-xs">{r.user?.name?.[0] || 'U'}</div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-black text-gray-900">{r.user?.name || 'Patient'}</p>
                                                            <p className="text-[10px] font-bold text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {r.comment && <p className="text-xs font-bold text-gray-600 ml-11">{r.comment}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Admin Actions Tab */}
                                {activeTab === 'actions' && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        {/* Block/Unblock */}
                                        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                            <h3 className="text-sm font-black text-gray-900 mb-4">Account Status</h3>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{doctor.user?.isBlocked ? 'Account is Blocked' : 'Account is Active'}</p>
                                                    <p className="text-xs font-bold text-gray-400 mt-0.5">{doctor.user?.isBlocked ? 'This doctor cannot access the platform' : 'This doctor has full access'}</p>
                                                </div>
                                                <button onClick={handleToggleBlock}
                                                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black border transition-all active:scale-95 ${doctor.user?.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}>
                                                    {doctor.user?.isBlocked ? <><RefreshCw size={12} /> Unblock</> : <><Ban size={12} /> Block</>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reset Password */}
                                        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                            <h3 className="text-sm font-black text-gray-900 mb-4">Reset Password</h3>
                                            <div className="flex gap-3">
                                                <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 transition-all" />
                                                <button onClick={handleResetPassword} disabled={passwordLoading}
                                                    className="flex items-center gap-2 px-5 py-3 bg-primary-700 text-white rounded-xl text-xs font-black hover:bg-primary-800 transition-all disabled:opacity-50 active:scale-95">
                                                    <Lock size={14} /> {passwordLoading ? 'Resetting...' : 'Reset Password'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Send Individual Announcement */}
                                        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                            <h3 className="text-sm font-black text-gray-900 mb-4">Send Individual Announcement</h3>
                                            <div className="space-y-3">
                                                <input type="text" placeholder="Announcement title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 transition-all" />
                                                <textarea placeholder="Announcement message..." value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} rows={3}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 transition-all resize-none" />
                                                <div className="flex items-center gap-3">
                                                    <select value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                                                        className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-200 transition-all">
                                                        <option value="info">Info</option>
                                                        <option value="warning">Warning</option>
                                                        <option value="critical">Critical</option>
                                                        <option value="success">Success</option>
                                                    </select>
                                                    <button onClick={handleSendAnnouncement} disabled={announcementLoading}
                                                        className="flex items-center gap-2 px-5 py-3 bg-primary-700 text-white rounded-xl text-xs font-black hover:bg-primary-800 transition-all disabled:opacity-50 active:scale-95">
                                                        <Send size={14} /> {announcementLoading ? 'Sending...' : 'Send Announcement'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Earnings Stats */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px]" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-200">Doctor Earnings</p>
                                        <p className="text-3xl font-black mt-1">Rs. {((data.totalEarnings || 0) / 1000).toFixed(1)}K</p>
                                        <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Platform Fees</p>
                                                <p className="text-lg font-black">Rs. {(data.platformFees || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest">Appointments</p>
                                                <p className="text-lg font-black">{(data.appointments || []).length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Quick Stats */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                    className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Appointment Stats</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Completed', value: (data.appointments || []).filter(a => a.status === 'completed').length, color: 'text-emerald-700' },
                                            { label: 'Confirmed', value: (data.appointments || []).filter(a => a.status === 'confirmed').length, color: 'text-primary-700' },
                                            { label: 'Cancelled', value: (data.appointments || []).filter(a => a.status === 'cancelled').length, color: 'text-red-500' },
                                            { label: 'No-Shows', value: (data.appointments || []).filter(a => a.status === 'no-show').length, color: 'text-orange-600' },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="text-xs font-black text-gray-500">{s.label}</span>
                                                <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Documents */}
                                {doctor.documents?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Documents</h3>
                                        <div className="space-y-2">
                                            {doctor.documents.map((doc, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <FileText size={14} className="text-primary-700" />
                                                    <span className="text-xs font-black text-gray-700 truncate flex-1">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Active Announcements */}
                                {(data.announcements || []).length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Active Announcements</h3>
                                        <div className="space-y-2">
                                            {data.announcements.map((a) => (
                                                <div key={a._id} className={`p-3 rounded-xl border text-xs font-bold ${a.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' : a.type === 'critical' ? 'bg-red-50 border-red-100 text-red-600' : a.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                                    <p className="font-black">{a.title}</p>
                                                    <p className="mt-0.5 opacity-75">{a.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDoctorDetail;
