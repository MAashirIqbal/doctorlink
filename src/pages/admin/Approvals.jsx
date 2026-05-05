import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, Bell, Search, Settings, LogOut, Shield,
    ChevronRight, ArrowRight, CheckCircle2, XCircle, AlertCircle, Eye,
    UserCheck, Stethoscope, BarChart3, CreditCard, LayoutDashboard,
    X, MapPin, Briefcase, Mail, Phone, FileText, ShieldCheck,
    GraduationCap, Clock, Download, Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPendingDoctors, approveDoctor, rejectDoctor } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals', active: true },
    { icon: Users, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const fileBase = apiBase.replace(/\/api\/?$/, '');
const toFileUrl = (p) => (!p ? '' : (p.startsWith('http') ? p : `${fileBase}${p}`));
const isImageDoc = (p) => /\.(png|jpe?g|webp|gif)$/i.test(p || '');

const DocRow = ({ label, path }) => {
    if (!path) {
        return (
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <FileText size={14} className="text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900">{label}</p>
                        <p className="text-[10px] font-bold text-red-500">Not uploaded</p>
                    </div>
                </div>
            </div>
        );
    }
    const url = toFileUrl(path);
    const filename = path.split('/').pop();
    return (
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
                {isImageDoc(path) ? (
                    <a href={url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        <img src={url} alt={label} className="w-full h-full object-cover" />
                    </a>
                ) : (
                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center border border-primary-100">
                        <FileText size={14} className="text-primary-700" />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900">{label}</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate">{filename}</p>
                </div>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-gray-100 text-gray-600 hover:text-primary-700 hover:border-primary-100 text-[11px] font-black transition-all"
            >
                <Eye size={12} />
                View
            </a>
        </div>
    );
};

const DetailModal = ({ doctor, onClose, onApprove, onReject }) => {
    if (!doctor) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200/60 max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                                <AlertCircle size={18} className="text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 font-display">Application Review</h3>
                                <p className="text-xs font-bold text-gray-400">Submitted {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : ''}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Doctor Profile */}
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-2xl border-4 border-white shadow-xl">{doctor.fullName?.[0] || 'D'}</div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 font-display">{doctor.fullName}</h2>
                                <p className="text-primary-700 font-bold">{doctor.specialization}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                        Pending Review
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: ShieldCheck, label: 'PMC Number', value: doctor.pmcNumber },
                                { icon: GraduationCap, label: 'Degree', value: doctor.degree },
                                { icon: Briefcase, label: 'Experience', value: `${doctor.experience} Years` },
                                { icon: CreditCard, label: 'Consultation Fee', value: `Rs. ${(doctor.fee || 0).toLocaleString()}` },
                                { icon: MapPin, label: 'Location', value: doctor.location },
                                { icon: Mail, label: 'Email', value: doctor.user?.email || doctor.email },
                                { icon: Phone, label: 'Phone', value: doctor.user?.phone || 'N/A' },
                                { icon: FileText, label: 'CNIC', value: doctor.cnic || 'N/A' },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <item.icon size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 truncate">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* About */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About / Bio</p>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">{doctor.about}</p>
                        </div>

                        {/* Documents */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Uploaded Documents</p>
                            <div className="space-y-2">
                                <DocRow label="PMC / PMDC License" path={doctor.documents?.pmcLicense} />
                                <DocRow label="Degree Certificate" path={doctor.documents?.degreeCertificate} />
                                <DocRow label="CNIC Copy" path={doctor.documents?.cnicCopy} />
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-3xl">
                        <button
                            onClick={() => { onReject(doctor._id); onClose(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-sm hover:bg-red-100 transition-all active:scale-95"
                        >
                            <XCircle size={16} />
                            Reject Application
                        </button>
                        <button
                            onClick={() => { onApprove(doctor._id); onClose(); }}
                            className="flex-[2] flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                        >
                            <CheckCircle2 size={16} />
                            Approve Doctor
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const AdminApprovals = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDoctors = async () => {
        try {
            const { data } = await getPendingDoctors();
            setDoctors(data.doctors || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchDoctors(); }, []);

    const filtered = doctors.filter(d =>
        (d.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toast = useToast();
    const handleApprove = async (id) => {
        try { await approveDoctor(id); fetchDoctors(); } catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleReject = async (id) => {
        try { await rejectDoctor(id); fetchDoctors(); } catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

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
                            {link.badge && (
                                <span className="ml-auto w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">{link.badge}</span>
                            )}
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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Doctor Approvals</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Review and manage doctor applications</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search applications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-6 mb-10">
                        {[
                            { label: 'Pending Review', value: doctors.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle },
                            { label: 'Total Applications', value: doctors.length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
                            { label: 'Needs Attention', value: doctors.length > 0 ? 'Yes' : 'No', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-sm shadow-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center border ${stat.border}`}>
                                        <stat.icon size={18} className={stat.color} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Application Cards */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                        ) : filtered.map((doc, i) => (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl border-2 border-white shadow-md">{doc.fullName?.[0] || 'D'}</div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">{doc.fullName}</h3>
                                                <p className="text-sm font-bold text-primary-700">{doc.specialization}</p>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-100">
                                                <AlertCircle size={12} />
                                                Pending Review
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <ShieldCheck size={13} className="text-primary-600" />
                                                {doc.pmcNumber}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase size={13} className="text-primary-600" />
                                                {doc.experience} yrs experience
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={13} className="text-primary-600" />
                                                {doc.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={13} className="text-gray-400" />
                                                Applied {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Degree</span>
                                                    <p className="text-sm font-black text-gray-900">{doc.degree}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee</span>
                                                    <p className="text-sm font-black text-gray-900">Rs. {(doc.fee || 0).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(doc._id)}
                                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all active:scale-95"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(doc._id)}
                                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black hover:bg-red-100 transition-all active:scale-95"
                                                >
                                                    <XCircle size={14} />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-xs font-black hover:bg-primary-50 hover:text-primary-700 hover:border-primary-100 transition-all"
                                                >
                                                    <Eye size={14} />
                                                    Full Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50">
                                <CheckCircle2 size={48} className="text-emerald-200 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2 font-display">All caught up!</h3>
                                <p className="text-gray-500 font-bold">No pending doctor applications to review.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            {selectedDoctor && (
                <DetailModal
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default AdminApprovals;
