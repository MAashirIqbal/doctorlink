import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Calendar, Settings, LogOut, Shield,
    CheckCircle2, XCircle, UserCheck, Stethoscope, BarChart3,
    CreditCard, LayoutDashboard, Mail, Heart, Megaphone,
    ArrowLeft, Clock, MapPin, DollarSign, Star, Phone,
    AlertCircle, RefreshCw, Eye, FileText, User
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { overrideAppointmentStatus } from '../../api/adminAPI';
import { getAppointmentDetail } from '../../api/appointmentAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Heart, label: 'Patients', path: '/admin/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments', active: true },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Confirmed', dot: 'bg-emerald-500' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Pending', dot: 'bg-amber-500' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', label: 'Completed', dot: 'bg-primary-500' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', label: 'Cancelled', dot: 'bg-red-500' },
    'no-show': { color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'No-Show', dot: 'bg-orange-500' },
    rescheduling: { color: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Rescheduling', dot: 'bg-blue-500' },
    expired: { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Expired', dot: 'bg-gray-400' },
};

const AdminAppointmentDetail = () => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await getAppointmentDetail(id);
            setData(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleOverride = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;
        setActionLoading(true);
        try {
            await overrideAppointmentStatus(id, { status: newStatus });
            fetchData();
        } catch (e) { alert(e.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };
    const apt = data?.appointment;
    const payment = data?.payment;
    const config = statusConfig[apt?.status] || statusConfig.pending;

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
                        <button onClick={() => navigate('/admin/appointments')} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Appointment Details</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View and manage appointment information</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                    ) : !apt ? (
                        <div className="text-center py-20"><p className="text-gray-400 font-bold">Appointment not found</p></div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status Banner */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-3xl border p-5 ${config.color}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${config.dot} animate-pulse`} />
                                            <div>
                                                <p className="text-lg font-black">{config.label}</p>
                                                <p className="text-xs font-bold opacity-75">Appointment #{apt._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold opacity-75">Payment</p>
                                            <p className={`text-sm font-black ${apt.paymentStatus === 'paid' ? 'text-emerald-700' : apt.paymentStatus === 'refunded' ? 'text-blue-700' : 'text-amber-700'}`}>
                                                {(apt.paymentStatus || 'pending').toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Patient & Doctor Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Patient</p>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg">{apt.patient?.name?.[0] || 'P'}</div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{apt.patient?.name || 'Patient'}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{apt.patient?.email}</p>
                                            </div>
                                        </div>
                                        {apt.patient?.phone && <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><Phone size={11} />{apt.patient.phone}</p>}
                                        <Link to={`/admin/patients/${apt.patient?._id}`} className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-primary-700 uppercase tracking-widest hover:underline">
                                            <Eye size={10} /> View Patient Profile
                                        </Link>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Doctor</p>
                                        <div className="flex items-center gap-3 mb-3">
                                            {apt.doctor?.avatar ? (
                                                <img src={apt.doctor.avatar} alt={apt.doctor.fullName} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg">{apt.doctor?.fullName?.[0] || 'D'}</div>
                                            )}
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{apt.doctor?.fullName || 'Doctor'}</p>
                                                <p className="text-[10px] font-bold text-primary-700">{apt.doctor?.specialization}</p>
                                            </div>
                                        </div>
                                        {apt.doctor?.location && <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><MapPin size={11} />{apt.doctor.location}</p>}
                                        <Link to={`/admin/doctors/${apt.doctor?._id}`} className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-primary-700 uppercase tracking-widest hover:underline">
                                            <Eye size={10} /> View Doctor Profile
                                        </Link>
                                    </motion.div>
                                </div>

                                {/* Appointment Details Grid */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                    className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                    <h3 className="text-sm font-black text-gray-900 mb-4">Appointment Information</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { icon: Calendar, label: 'Date', value: new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                                            { icon: Clock, label: 'Time Slot', value: apt.timeSlot },
                                            { icon: DollarSign, label: 'Consultation Fee', value: `Rs. ${(apt.fee || 0).toLocaleString()}` },
                                            { icon: FileText, label: 'Appointment ID', value: apt._id.slice(-8).toUpperCase() },
                                            { icon: Calendar, label: 'Booked On', value: new Date(apt.createdAt).toLocaleDateString() },
                                            { icon: CreditCard, label: 'Payment Status', value: (apt.paymentStatus || 'pending').toUpperCase() },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <item.icon size={12} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Payment Details */}
                                {payment && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                        <h3 className="text-sm font-black text-gray-900 mb-4">Payment Details</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[
                                                { label: 'Total Amount', value: `Rs. ${(payment.amount || 0).toLocaleString()}` },
                                                { label: 'Doctor Earning', value: `Rs. ${(payment.doctorEarning || 0).toLocaleString()}` },
                                                { label: 'Platform Fee', value: `Rs. ${(payment.platformFee || 0).toLocaleString()}` },
                                                { label: 'Patient Fee', value: `Rs. ${(payment.patientPlatformFee || 0).toLocaleString()}` },
                                                { label: 'Method', value: (payment.paymentMethod || 'stripe').toUpperCase() },
                                                { label: 'Transaction ID', value: payment.stripeSessionId ? payment.stripeSessionId.slice(-12) : 'N/A' },
                                            ].map((item, i) => (
                                                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                                                    <p className="text-sm font-black text-gray-900">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Reschedule History */}
                                {apt.rescheduleHistory?.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                        className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                        <h3 className="text-sm font-black text-gray-900 mb-4">Reschedule History</h3>
                                        <div className="space-y-3">
                                            {apt.rescheduleHistory.map((h, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <RefreshCw size={14} className="text-blue-500 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-gray-900">
                                                            {new Date(h.fromDate).toLocaleDateString()} {h.fromTimeSlot} → {new Date(h.toDate).toLocaleDateString()} {h.toTimeSlot}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400">
                                                            {h.status} — {new Date(h.requestedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Right Column - Admin Actions */}
                            <div className="space-y-6">
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Admin Actions</h3>
                                    <div className="space-y-2">
                                        {apt.status === 'pending' && (
                                            <button onClick={() => handleOverride('confirmed')} disabled={actionLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-600/20">
                                                <CheckCircle2 size={14} /> Confirm Appointment
                                            </button>
                                        )}
                                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                            <button onClick={() => handleOverride('cancelled')} disabled={actionLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-sm hover:bg-red-100 transition-all disabled:opacity-50 active:scale-95">
                                                <XCircle size={14} /> Cancel Appointment
                                            </button>
                                        )}
                                        {apt.status === 'confirmed' && (
                                            <button onClick={() => handleOverride('completed')} disabled={actionLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-700 text-white rounded-xl font-black text-sm hover:bg-primary-800 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary-700/20">
                                                <CheckCircle2 size={14} /> Mark Completed
                                            </button>
                                        )}
                                        {(apt.status === 'no-show' || apt.status === 'expired') && (
                                            <button onClick={() => handleOverride('cancelled')} disabled={actionLoading}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-black text-sm hover:bg-gray-200 transition-all disabled:opacity-50 active:scale-95">
                                                <XCircle size={14} /> Force Cancel
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Override Status</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'expired'].filter(s => s !== apt.status).map(s => {
                                                const sc = statusConfig[s];
                                                return (
                                                    <button key={s} onClick={() => handleOverride(s)} disabled={actionLoading}
                                                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:opacity-80 disabled:opacity-50 active:scale-95 ${sc.color}`}>
                                                        {sc.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* No-Show Info */}
                                {apt.noShowAt && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                        className="bg-orange-50 rounded-3xl border border-orange-100 p-6">
                                        <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">No-Show Details</h3>
                                        <div className="space-y-2 text-xs font-bold text-orange-700">
                                            <p>Marked at: {new Date(apt.noShowAt).toLocaleString()}</p>
                                            <p>Marked by: {apt.noShowMarkedBy || 'system'}</p>
                                            <p>Reschedule attempts: {apt.rescheduleCount || 0} / {apt.maxReschedules || 2}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Pending Reschedule */}
                                {apt.pendingReschedule?.date && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="bg-blue-50 rounded-3xl border border-blue-100 p-6">
                                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Pending Reschedule</h3>
                                        <div className="space-y-2 text-xs font-bold text-blue-700">
                                            <p>New Date: {new Date(apt.pendingReschedule.date).toLocaleDateString()}</p>
                                            <p>New Slot: {apt.pendingReschedule.timeSlot}</p>
                                            <p>Requested: {new Date(apt.pendingReschedule.requestedAt).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Quick Links */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                    className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Links</h3>
                                    <div className="space-y-2">
                                        <Link to={`/admin/patients/${apt.patient?._id}`}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-black text-gray-700 hover:bg-gray-100 transition-all">
                                            <User size={14} className="text-gray-400" /> View Patient
                                        </Link>
                                        <Link to={`/admin/doctors/${apt.doctor?._id}`}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-black text-gray-700 hover:bg-gray-100 transition-all">
                                            <Stethoscope size={14} className="text-gray-400" /> View Doctor
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminAppointmentDetail;
