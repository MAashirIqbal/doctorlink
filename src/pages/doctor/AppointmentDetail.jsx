import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Activity, LogOut, ArrowLeft,
    Users, Wallet, ClipboardList, Stethoscope, CheckCircle2,
    XCircle, AlertCircle, Phone, Mail, MapPin, CreditCard,
    FileText, DollarSign, Upload, Send, X, Search, MessageCircle
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentDetail, acceptAppointment, rejectAppointment, completeAppointment, markNoShow, acceptReschedule, rejectReschedule, uploadPrescription, referAppointment } from '../../api/appointmentAPI';
import { getDoctors } from '../../api/doctorAPI';
import { FILE_BASE, resolveFileUrl } from '../../api/axios';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments', active: true },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertCircle, label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle, label: 'Cancelled' },
    'no-show': { color: 'bg-orange-50 text-orange-700 border-orange-100', icon: AlertCircle, label: 'No-Show' },
    rescheduling: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock, label: 'Reschedule Pending' },
    expired: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle, label: 'Expired' },
};

const DoctorAppointmentDetail = () => {
    const { user, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [payment, setPayment] = useState(null);
    const [feeInfo, setFeeInfo] = useState({ patientPlatformFeePercent: 0, doctorPlatformFeePercent: 10 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetail = async () => {
        try {
            const { data } = await getAppointmentDetail(id);
            setAppointment(data.appointment);
            setPayment(data.payment);
            setFeeInfo({
                patientPlatformFeePercent: data.patientPlatformFeePercent ?? 0,
                doctorPlatformFeePercent: data.doctorPlatformFeePercent ?? 10,
            });
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchDetail(); }, [id]);

    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            await acceptAppointment(id);
            await fetchDetail();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject this appointment?')) return;
        setActionLoading(true);
        try {
            await rejectAppointment(id, { reason: 'Rejected by doctor' });
            await fetchDetail();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleComplete = async () => {
        setActionLoading(true);
        try {
            await completeAppointment(id);
            await fetchDetail();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleNoShow = async () => {
        if (!window.confirm('Mark this appointment as no-show? The patient will be notified.')) return;
        setActionLoading(true);
        try {
            await markNoShow(id);
            await fetchDetail();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleAcceptReschedule = async () => {
        setActionLoading(true);
        try {
            await acceptReschedule(id);
            await fetchDetail();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleRejectReschedule = async () => {
        if (!window.confirm('Reject this reschedule request?')) return;
        setActionLoading(true);
        try {
            await rejectReschedule(id);
            await fetchDetail();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    // ===== Prescription =====
    const [rxFile, setRxFile] = useState(null);
    const [rxNotes, setRxNotes] = useState('');
    const [rxLoading, setRxLoading] = useState(false);

    const handleUploadRx = async (e) => {
        e.preventDefault();
        if (!rxFile) return toast.error('Please pick a file');
        setRxLoading(true);
        try {
            const fd = new FormData();
            fd.append('prescription', rxFile);
            if (rxNotes) fd.append('notes', rxNotes);
            await uploadPrescription(id, fd);
            toast.success('Prescription uploaded');
            setRxFile(null);
            setRxNotes('');
            await fetchDetail();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        }
        setRxLoading(false);
    };

    // ===== Referral =====
    const [showReferral, setShowReferral] = useState(false);
    const [referralSearch, setReferralSearch] = useState('');
    const [referralOptions, setReferralOptions] = useState([]);
    const [referralTo, setReferralTo] = useState(null);
    const [referralDate, setReferralDate] = useState('');
    const [referralTime, setReferralTime] = useState('');
    const [referralReason, setReferralReason] = useState('');
    const [referralLoading, setReferralLoading] = useState(false);

    const openReferral = async () => {
        setShowReferral(true);
        try {
            const { data } = await getDoctors({ limit: 30 });
            setReferralOptions(data.doctors || []);
        } catch { /* empty */ }
    };

    const handleSubmitReferral = async (e) => {
        e.preventDefault();
        if (!referralTo || !referralDate || !referralTime) {
            return toast.error('Pick a doctor, date, and time slot');
        }
        setReferralLoading(true);
        try {
            await referAppointment(id, {
                toDoctorId: referralTo._id,
                date: referralDate,
                timeSlot: referralTime,
                reason: referralReason,
            });
            toast.success('Referral sent');
            setShowReferral(false);
            setReferralTo(null);
            setReferralDate('');
            setReferralTime('');
            setReferralReason('');
            await fetchDetail();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Referral failed');
        }
        setReferralLoading(false);
    };

    const config = statusConfig[appointment?.status] || statusConfig.pending;
    const filteredReferralOptions = referralOptions.filter((d) => {
        const q = referralSearch.toLowerCase();
        return !q || d.fullName?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q);
    });

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
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/doctor/appointments')} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all">
                            <ArrowLeft size={18} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Appointment Details</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View appointment information and manage status</p>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                    ) : !appointment ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 font-bold">Appointment not found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status Banner */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl p-5 border flex items-center justify-between ${config.color}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <config.icon size={20} />
                                        <div>
                                            <p className="text-sm font-black">{config.label}</p>
                                            <p className="text-xs font-bold opacity-70">
                                                Payment: {appointment.paymentStatus === 'paid' ? 'Paid' : appointment.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {appointment.status === 'pending' && (
                                            <>
                                                <button onClick={handleAccept} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all disabled:opacity-50">
                                                    Accept
                                                </button>
                                                <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-all disabled:opacity-50">
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {appointment.status === 'confirmed' && (
                                            <>
                                                <button onClick={handleComplete} disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-xl text-xs font-black hover:bg-primary-800 transition-all disabled:opacity-50">
                                                    Mark Complete
                                                </button>
                                                <button onClick={openReferral} disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all disabled:opacity-50">
                                                    Refer
                                                </button>
                                                {new Date(appointment.date) < new Date() && (
                                                    <button onClick={handleNoShow} disabled={actionLoading} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black hover:bg-orange-600 transition-all disabled:opacity-50">
                                                        Mark No-Show
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {appointment.status === 'rescheduling' && (
                                            <>
                                                <button onClick={handleAcceptReschedule} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all disabled:opacity-50">
                                                    Accept Reschedule
                                                </button>
                                                <button onClick={handleRejectReschedule} disabled={actionLoading} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-all disabled:opacity-50">
                                                    Reject Reschedule
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Reschedule Request Info */}
                                {appointment.status === 'rescheduling' && appointment.pendingReschedule && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.03 }}
                                        className="bg-blue-50 rounded-2xl border border-blue-200 p-5"
                                    >
                                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Reschedule Request</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Current Slot</span>
                                                <p className="text-sm font-black text-blue-900 mt-1">{new Date(appointment.date).toLocaleDateString()} — {appointment.timeSlot}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Requested Slot</span>
                                                <p className="text-sm font-black text-blue-900 mt-1">{new Date(appointment.pendingReschedule.date).toLocaleDateString()} — {appointment.pendingReschedule.timeSlot}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-blue-500 mt-3">Reschedule attempt {(appointment.rescheduleCount || 0) + 1} of {appointment.maxReschedules || 2}</p>
                                    </motion.div>
                                )}

                                {/* No-Show / Expired Info */}
                                {appointment.status === 'no-show' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.03 }}
                                        className="bg-orange-50 rounded-2xl border border-orange-200 p-5"
                                    >
                                        <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">No-Show Details</h3>
                                        <p className="text-sm font-bold text-orange-700">Patient did not attend. Marked {appointment.noShowMarkedBy === 'system' ? 'automatically by system' : 'by you'}.</p>
                                        <p className="text-xs font-bold text-orange-500 mt-1">Reschedule attempts remaining: {(appointment.maxReschedules || 2) - (appointment.rescheduleCount || 0)}</p>
                                    </motion.div>
                                )}

                                {/* Prescription (visible only when completed) */}
                                {appointment.status === 'completed' && (
                                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.035 }}
                                        className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Prescription</h3>
                                        {appointment.prescription?.url ? (
                                            <div className="space-y-3">
                                                <a href={`${FILE_BASE}${appointment.prescription.url}`} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all">
                                                    <FileText size={18} className="text-emerald-700" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-emerald-800">Uploaded prescription</p>
                                                        <p className="text-[10px] font-bold text-emerald-600">{new Date(appointment.prescription.uploadedAt).toLocaleString()}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">View</span>
                                                </a>
                                                {appointment.prescription.notes && (
                                                    <p className="text-xs font-bold text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">{appointment.prescription.notes}</p>
                                                )}
                                                <p className="text-[10px] font-bold text-gray-400">Re-upload below to replace</p>
                                            </div>
                                        ) : null}

                                        <form onSubmit={handleUploadRx} className="space-y-3 mt-3">
                                            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-200">
                                                <Upload size={16} className="text-gray-400" />
                                                <span className="text-xs font-bold text-gray-500 truncate">{rxFile ? rxFile.name : 'Click to attach prescription (PDF / JPG / PNG, max 5 MB)'}</span>
                                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setRxFile(e.target.files?.[0] || null)} />
                                            </label>
                                            <textarea value={rxNotes} onChange={(e) => setRxNotes(e.target.value)} rows={2} maxLength={500}
                                                placeholder="Notes for the patient (optional)"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold text-gray-900 focus:outline-none focus:border-primary-200" />
                                            <button type="submit" disabled={!rxFile || rxLoading}
                                                className="w-full bg-primary-700 hover:bg-primary-600 text-white py-3 rounded-xl text-xs font-black transition-all disabled:opacity-50">
                                                {rxLoading ? 'Uploading...' : (appointment.prescription?.url ? 'Replace prescription' : 'Upload prescription')}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Reschedule History */}
                                {appointment.rescheduleHistory?.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.04 }}
                                        className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-5"
                                    >
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Reschedule History</h3>
                                        <div className="space-y-2">
                                            {appointment.rescheduleHistory.map((entry, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                                                    <div>
                                                        <span className="font-bold text-gray-500">{new Date(entry.fromDate).toLocaleDateString()} {entry.fromTimeSlot}</span>
                                                        <span className="mx-2 text-gray-300">→</span>
                                                        <span className="font-bold text-gray-700">{new Date(entry.toDate).toLocaleDateString()} {entry.toTimeSlot}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${entry.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                                        {entry.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Patient Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Information</h3>
                                        {appointment.patient?._id && (
                                            <Link to={`/messages?with=${appointment.patient._id}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                <Send size={11} />
                                                Message
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-4">
                                        {appointment.patient?.avatar ? (
                                            <img src={resolveFileUrl(appointment.patient.avatar)} alt={appointment.patient.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl border-2 border-white shadow-md">
                                                {appointment.patient?.name?.[0] || 'P'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h2 className="text-xl font-black text-gray-900">{appointment.patient?.name || 'Patient'}</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                                {appointment.patient?.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        <span className="font-bold">{appointment.patient.email}</span>
                                                    </div>
                                                )}
                                                {appointment.patient?.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} className="text-gray-400" />
                                                        <span className="font-bold">{appointment.patient.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Appointment Details */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                >
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Appointment Details</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Time</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{appointment.timeSlot}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <FileText size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">ID</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 font-mono">{appointment._id?.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Booked</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{new Date(appointment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Payment Info */}
                                {payment && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                    >
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Payment & Earnings</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultation Fee</span>
                                                <p className="text-lg font-black text-gray-900 mt-1">Rs. {(appointment.fee || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fee ({feeInfo.doctorPlatformFeePercent}%)</span>
                                                <p className="text-lg font-black text-red-500 mt-1">- Rs. {(payment.platformFee || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Earning</span>
                                                <p className="text-lg font-black text-emerald-600 mt-1">Rs. {(payment.doctorEarning || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
                                                <p className={`text-sm font-black mt-1 ${payment.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {payment.status === 'completed' ? 'Received' : payment.status}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Right Column - Summary */}
                            <div className="space-y-6">
                                {/* Fee Summary */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                >
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Fee Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-gray-500">Consultation Fee</span>
                                            <span className="font-black text-gray-900">Rs. {(appointment.fee || 0).toLocaleString()}</span>
                                        </div>
                                        {payment && (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-bold text-gray-500">Platform Fee</span>
                                                    <span className="font-black text-red-500">- Rs. {(payment.platformFee || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                                                    <span className="font-black text-gray-900">Your Earning</span>
                                                    <span className="font-black text-emerald-600">Rs. {(payment.doctorEarning || 0).toLocaleString()}</span>
                                                </div>
                                            </>
                                        )}
                                        {!payment && (
                                            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                                                <span className="font-black text-gray-900">Payment</span>
                                                <span className="font-black text-amber-600">Pending</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Quick Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                >
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <Link to="/doctor/appointments" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold text-gray-600">
                                            <Calendar size={16} className="text-gray-400" />
                                            All Appointments
                                        </Link>
                                        <Link to="/doctor/patients" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold text-gray-600">
                                            <Users size={16} className="text-gray-400" />
                                            My Patients
                                        </Link>
                                        <Link to="/doctor/earnings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold text-gray-600">
                                            <DollarSign size={16} className="text-gray-400" />
                                            Earnings Report
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Referral Modal */}
            {showReferral && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReferral(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200/60 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 font-display">Refer to Another Doctor</h3>
                                <p className="text-xs font-bold text-gray-400">Pick a specialist, propose a slot, and add a reason.</p>
                            </div>
                            <button onClick={() => setShowReferral(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReferral} className="p-6 space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Search doctor</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input value={referralSearch} onChange={(e) => setReferralSearch(e.target.value)}
                                        placeholder="Name or specialization"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-3 py-3 text-sm font-bold focus:outline-none focus:border-primary-200" />
                                </div>
                                <div className="mt-3 max-h-52 overflow-y-auto space-y-1.5 pr-1">
                                    {filteredReferralOptions.slice(0, 12).map((d) => (
                                        <button key={d._id} type="button" onClick={() => setReferralTo(d)}
                                            className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border transition-all ${referralTo?._id === d._id ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                            <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-black">{d.fullName?.[0]}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-900 truncate">{d.fullName}</p>
                                                <p className="text-[10px] font-bold text-primary-700 truncate">{d.specialization}</p>
                                            </div>
                                            {referralTo?._id === d._id && <CheckCircle2 size={14} className="text-primary-700" />}
                                        </button>
                                    ))}
                                    {filteredReferralOptions.length === 0 && (
                                        <p className="text-center text-xs font-bold text-gray-400 py-4">No matching doctors</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Date</label>
                                    <input type="date" value={referralDate} onChange={(e) => setReferralDate(e.target.value)} required
                                        min={new Date().toISOString().slice(0, 10)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-primary-200" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Time slot</label>
                                    <input type="text" value={referralTime} onChange={(e) => setReferralTime(e.target.value)}
                                        placeholder="e.g. 10:00 AM" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-primary-200" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Reason (optional)</label>
                                <textarea value={referralReason} onChange={(e) => setReferralReason(e.target.value)} rows={3} maxLength={300}
                                    placeholder="Why are you referring this patient?"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-primary-200" />
                            </div>

                            <button type="submit" disabled={referralLoading || !referralTo}
                                className="w-full bg-primary-700 hover:bg-primary-600 text-white py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                <Send size={16} />
                                {referralLoading ? 'Sending...' : 'Send Referral'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointmentDetail;
