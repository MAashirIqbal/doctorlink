import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Star, User, Activity, LogOut,
    ArrowLeft, CheckCircle2, XCircle, AlertCircle, CreditCard,
    Download, Printer, FileText, Phone, Mail, Search,
    ShieldCheck, Receipt, Hash, Building2, MessageCircle, Sparkles
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentDetail, cancelAppointment, rescheduleAppointment } from '../../api/appointmentAPI';
import { createCheckout } from '../../api/paymentAPI';
import { getDoctorSlots } from '../../api/doctorAPI';
import ClinicMap from '../../components/ClinicMap';
import { resolveFileUrl } from '../../api/axios';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
    { icon: Sparkles, label: 'Symptom Analyzer', path: '/patient/symptom-analyzer' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Search, label: 'Find Doctors', path: '/doctors' },
    { icon: User, label: 'My Profile', path: '/patient/profile' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle, label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-200', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, label: 'Cancelled' },
    'no-show': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle, label: 'Missed (No-Show)' },
    rescheduling: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: 'Reschedule Pending' },
    expired: { color: 'bg-gray-100 text-gray-500 border-gray-300', icon: XCircle, label: 'Expired' },
};

const paymentStatusConfig = {
    paid: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Paid' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Unpaid' },
    refunded: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Refunded' },
};

const AppointmentDetail = () => {
    const { id } = useParams();
    const { user, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feeInfo, setFeeInfo] = useState({ patientPlatformFeePercent: 0, doctorPlatformFeePercent: 10 });
    const invoiceRef = useRef(null);
    const [showReschedule, setShowReschedule] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleSlot, setRescheduleSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    useEffect(() => {
        const init = async () => {
            await fetchDetail();
            setLoading(false);
        };
        init();
    }, [id]);

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
            setError(err.response?.data?.message || 'Failed to load appointment');
        }
    };

    const handleFetchSlots = async (dateStr) => {
        if (!dateStr || !appointment?.doctor?._id) return;
        setSlotsLoading(true);
        setRescheduleSlot('');
        try {
            const { data } = await getDoctorSlots(appointment.doctor._id, { date: dateStr });
            setAvailableSlots(data.availableSlots || []);
        } catch (err) {
            setAvailableSlots([]);
        }
        setSlotsLoading(false);
    };

    const handleReschedule = async () => {
        if (!rescheduleDate || !rescheduleSlot) return toast.warning('Please select a date and time slot');
        setRescheduleLoading(true);
        try {
            await rescheduleAppointment(id, { date: rescheduleDate, timeSlot: rescheduleSlot });
            setShowReschedule(false);
            setRescheduleDate('');
            setRescheduleSlot('');
            await fetchDetail();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reschedule');
        }
        setRescheduleLoading(false);
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await cancelAppointment(id, { reason: 'Cancelled by patient' });
            const { data } = await getAppointmentDetail(id);
            setAppointment(data.appointment);
            setPayment(data.payment);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const handlePayNow = async () => {
        try {
            const { data } = await createCheckout({ appointmentId: id });
            if (data?.url) {
                window.location.href = data.url;
                return;
            }
            toast.error('Failed to start checkout');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start checkout');
        }
    };

    const handlePrintInvoice = () => {
        const content = invoiceRef.current;
        if (!content) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${appointment?._id?.slice(-8)?.toUpperCase()}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
                    .logo { font-size: 24px; font-weight: 900; }
                    .logo span { color: #4f46e5; }
                    .invoice-title { text-align: right; }
                    .invoice-title h2 { font-size: 28px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 2px; }
                    .invoice-title p { color: #6b7280; font-size: 13px; margin-top: 4px; }
                    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 36px; }
                    .party h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 800; margin-bottom: 8px; }
                    .party p { font-size: 14px; color: #374151; line-height: 1.6; }
                    .party .name { font-weight: 800; font-size: 16px; color: #111827; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 36px; padding: 20px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; }
                    .detail-item h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 800; margin-bottom: 4px; }
                    .detail-item p { font-size: 14px; font-weight: 700; color: #111827; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    th { text-align: left; padding: 12px 16px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 800; border-bottom: 2px solid #e5e7eb; }
                    td { padding: 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
                    td.amount { text-align: right; font-weight: 800; }
                    th.amount { text-align: right; }
                    .totals { margin-left: auto; width: 280px; }
                    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #6b7280; }
                    .total-row.final { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 4px; font-size: 18px; font-weight: 900; color: #111827; }
                    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
                    .status-paid { background: #ecfdf5; color: #059669; }
                    .status-pending { background: #fffbeb; color: #d97706; }
                    .status-refunded { background: #eff6ff; color: #2563eb; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 300);
    };

    const handleLogout = () => { localStorage.setItem('lastRole', 'patient'); logout(); navigate('/'); };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
                <XCircle size={48} className="text-red-300 mb-4" />
                <h2 className="text-xl font-black text-gray-900 mb-2">{error || 'Appointment not found'}</h2>
                <Link to="/patient/appointments" className="text-primary-700 font-black text-sm hover:underline">← Back to Appointments</Link>
            </div>
        );
    }

    const doc = appointment.doctor;
    const patient = appointment.patient;
    const status = statusConfig[appointment.status] || statusConfig.pending;
    const payStatus = paymentStatusConfig[appointment.paymentStatus] || paymentStatusConfig.pending;
    const StatusIcon = status.icon;
    const invoiceNumber = `INV-${appointment._id.slice(-8).toUpperCase()}`;
    const appointmentDate = new Date(appointment.date);

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
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link, i) => (
                        <Link
                            key={i}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${link.path === '/patient/appointments'
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
                        {user?.avatar ? (
                            <img src={resolveFileUrl(user.avatar)} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">
                                {user?.name?.[0] || 'P'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" /></button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/patient/appointments" className="flex items-center gap-2 text-gray-400 hover:text-primary-700 font-black text-sm transition-colors">
                                <ArrowLeft size={16} />
                                Back
                            </Link>
                            <div className="w-px h-6 bg-gray-200" />
                            <h1 className="text-xl font-black text-gray-900 font-display tracking-tight">Appointment Details</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {payment && (
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-all"
                                >
                                    <Printer size={14} />
                                    Print Invoice
                                </button>
                            )}
                            {payment && (
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 rounded-xl text-sm font-black text-white hover:bg-primary-800 transition-all shadow-sm"
                                >
                                    <Download size={14} />
                                    Download PDF
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-5xl">
                    {/* Status Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-4 p-5 rounded-2xl border mb-8 ${status.color}`}
                    >
                        <StatusIcon size={22} />
                        <div>
                            <p className="font-black text-sm">{status.label} Appointment</p>
                            <p className="text-xs font-bold opacity-75 mt-0.5">
                                {appointment.status === 'confirmed' && 'Your appointment is confirmed and scheduled.'}
                                {appointment.status === 'pending' && 'Waiting for confirmation and payment.'}
                                {appointment.status === 'completed' && 'This appointment has been completed.'}
                                {appointment.status === 'cancelled' && `Cancelled${appointment.cancelReason ? `: ${appointment.cancelReason}` : ''}`}
                                {appointment.status === 'no-show' && `You missed this appointment. You can reschedule ${(appointment.maxReschedules || 2) - (appointment.rescheduleCount || 0)} more time(s).`}
                                {appointment.status === 'rescheduling' && `Your reschedule request is pending doctor approval. New slot: ${appointment.pendingReschedule?.date ? new Date(appointment.pendingReschedule.date).toLocaleDateString() : ''} at ${appointment.pendingReschedule?.timeSlot || ''}`}
                                {appointment.status === 'expired' && 'This appointment has expired. No more reschedule attempts available.'}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${payStatus.color}`}>
                                {payStatus.label}
                            </span>
                        </div>
                    </motion.div>

                    {/* Prescription (only after completion) */}
                    {appointment.status === 'completed' && appointment.prescription?.url && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-emerald-100">
                                <FileText size={20} className="text-emerald-700" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-emerald-900">Prescription available</p>
                                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                                    Uploaded {new Date(appointment.prescription.uploadedAt).toLocaleString()}
                                </p>
                                {appointment.prescription.notes && (
                                    <p className="text-xs font-bold text-emerald-800 mt-2 bg-white/60 rounded-lg p-2 border border-emerald-100">
                                        {appointment.prescription.notes}
                                    </p>
                                )}
                            </div>
                            <a href={`${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}${appointment.prescription.url}`}
                                target="_blank" rel="noreferrer"
                                className="self-center flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all">
                                <Download size={14} />
                                Open
                            </a>
                        </motion.div>
                    )}

                    {/* Referred-from notice */}
                    {appointment.referredFrom?.appointment && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
                            <FileText size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-blue-800 leading-relaxed">
                                This appointment was created via a referral{appointment.referredFrom.reason ? `: ${appointment.referredFrom.reason}` : '.'}
                            </p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column — Doctor & Appointment Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Doctor Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6"
                            >
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Doctor Information</p>
                                <div className="flex items-center gap-5">
                                    {doc?.avatar ? (
                                        <img src={resolveFileUrl(doc.avatar)} alt={doc.fullName} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-2xl border-4 border-white shadow-lg">
                                            {doc?.fullName?.[0]}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-gray-900 font-display">{doc?.fullName}</h3>
                                        <p className="text-sm font-bold text-primary-700">{doc?.specialization}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            {doc?.rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-black text-gray-700">{doc.rating}</span>
                                                </div>
                                            )}
                                            {doc?.location && (
                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                    <MapPin size={10} />
                                                    {doc.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/doctors/${doc?._id}`}
                                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-all"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                                {/* Clinic map + ETA (only shown after the appointment is confirmed) */}
                                {appointment.status === 'confirmed' && (
                                    <div className="mt-5">
                                        <ClinicMap doctor={doc} />
                                    </div>
                                )}
                            </motion.div>

                            {/* Appointment Details Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6"
                            >
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Appointment Details</p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: Calendar, label: 'Date', value: appointmentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                                        { icon: Clock, label: 'Time Slot', value: appointment.timeSlot },
                                        { icon: Hash, label: 'Appointment ID', value: appointment._id.slice(-8).toUpperCase() },
                                        { icon: Calendar, label: 'Booked On', value: new Date(appointment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <item.icon size={12} className="text-primary-600" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Payment & Transaction */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment & Transaction</p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${payStatus.color}`}>
                                        {payStatus.label}
                                    </span>
                                </div>

                                {payment ? (
                                    <div className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Receipt size={12} className="text-primary-600" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</span>
                                                </div>
                                                <p className="text-xs font-black text-gray-900 font-mono">{payment.stripePaymentIntentId || 'N/A'}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <CreditCard size={12} className="text-primary-600" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</span>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">Stripe</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Calendar size={12} className="text-primary-600" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Date</span>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">
                                                    {new Date(payment.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <FileText size={12} className="text-primary-600" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice No.</span>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">{invoiceNumber}</p>
                                            </div>
                                        </div>

                                        {/* Amount Breakdown */}
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-bold text-gray-500">Consultation Fee</span>
                                                    <span className="font-black text-gray-900">Rs. {(appointment.fee || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-bold text-gray-500">Platform Fee</span>
                                                    <span className="font-black text-emerald-600">
                                                        {(payment.patientPlatformFee || 0) > 0
                                                            ? `Rs. ${payment.patientPlatformFee.toLocaleString()}`
                                                            : 'Rs. 0'}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                                    <span className="font-black text-gray-900 uppercase tracking-wider text-sm">Total Paid</span>
                                                    <span className="text-xl font-black text-primary-700">Rs. {payment.amount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {payment.status === 'refunded' && payment.refundedAt && (
                                            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                                <p className="text-sm font-black text-blue-700">
                                                    Refunded on {new Date(payment.refundedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                                        <CreditCard size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-gray-400">No payment record found</p>
                                        {appointment.paymentStatus === 'pending' && appointment.status !== 'cancelled' && (
                                            <button
                                                onClick={handlePayNow}
                                                className="mt-4 px-6 py-3 bg-[#635BFF] text-white rounded-xl font-black text-sm hover:bg-[#5851DB] transition-all shadow-lg shadow-[#635BFF]/20"
                                            >
                                                <CreditCard size={14} className="inline mr-2" />
                                                Pay Now — Rs. {appointment.fee?.toLocaleString()}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Right Column — Patient Info & Actions */}
                        <div className="space-y-6">
                            {/* Patient Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6"
                            >
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Patient Information</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {user?.avatar ? (
                                            <img src={resolveFileUrl(user.avatar)} alt={user?.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg border-2 border-white shadow-sm">
                                                {patient?.name?.[0] || 'P'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-black text-gray-900">{patient?.name}</p>
                                            <p className="text-xs font-bold text-gray-400">Patient</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail size={13} className="text-gray-400" />
                                            <span className="font-bold text-gray-600">{patient?.email}</span>
                                        </div>
                                        {patient?.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone size={13} className="text-gray-400" />
                                                <span className="font-bold text-gray-600">{patient.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6"
                            >
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Fee Summary</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-500">Consultation</span>
                                        <span className="font-black text-gray-900">Rs. {(appointment.fee || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-500">Platform Fee</span>
                                        <span className="font-black text-emerald-600">
                                            {payment && (payment.patientPlatformFee || 0) > 0
                                                ? `Rs. ${payment.patientPlatformFee.toLocaleString()}`
                                                : 'Rs. 0'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                                        <span className="font-black text-gray-900 text-sm">Total</span>
                                        <span className="text-lg font-black text-primary-700">Rs. {(payment ? payment.amount : appointment.fee || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-3"
                            >
                                {appointment.paymentStatus === 'pending' && appointment.status !== 'cancelled' && (
                                    <button
                                        onClick={handlePayNow}
                                        className="w-full py-4 bg-[#635BFF] text-white rounded-2xl font-black text-sm hover:bg-[#5851DB] transition-all shadow-lg shadow-[#635BFF]/20 flex items-center justify-center gap-2"
                                    >
                                        <CreditCard size={16} />
                                        Pay Now — Rs. {(appointment.fee || 0).toLocaleString()}
                                    </button>
                                )}
                                {['pending', 'confirmed'].includes(appointment.status) && (
                                    <button
                                        onClick={handleCancel}
                                        className="w-full py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={16} />
                                        Cancel Appointment
                                    </button>
                                )}

                                {/* Reschedule for no-show */}
                                {appointment.status === 'no-show' && (appointment.rescheduleCount || 0) < (appointment.maxReschedules || 2) && (
                                    <>
                                        {!showReschedule ? (
                                            <button
                                                onClick={() => setShowReschedule(true)}
                                                className="w-full py-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-2xl font-black text-sm hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Calendar size={16} />
                                                Reschedule Appointment ({(appointment.maxReschedules || 2) - (appointment.rescheduleCount || 0)} attempt{((appointment.maxReschedules || 2) - (appointment.rescheduleCount || 0)) !== 1 ? 's' : ''} left)
                                            </button>
                                        ) : (
                                            <div className="bg-white rounded-2xl border border-orange-200 p-5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-black text-gray-900">Pick a New Slot</h4>
                                                    <button onClick={() => { setShowReschedule(false); setRescheduleDate(''); setRescheduleSlot(''); setAvailableSlots([]); }} className="text-gray-400 hover:text-gray-600">
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Select Date</label>
                                                    <input
                                                        type="date"
                                                        value={rescheduleDate}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onChange={(e) => { setRescheduleDate(e.target.value); handleFetchSlots(e.target.value); }}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-300"
                                                    />
                                                </div>

                                                {rescheduleDate && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Available Slots</label>
                                                        {slotsLoading ? (
                                                            <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                                                        ) : availableSlots.length > 0 ? (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {availableSlots.map((slot) => (
                                                                    <button
                                                                        key={slot}
                                                                        onClick={() => setRescheduleSlot(slot)}
                                                                        className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all ${rescheduleSlot === slot
                                                                            ? 'bg-primary-700 text-white border-primary-700'
                                                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-primary-200 hover:bg-primary-50'
                                                                        }`}
                                                                    >
                                                                        {slot}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs font-bold text-gray-400 text-center py-3">No available slots on this date</p>
                                                        )}
                                                    </div>
                                                )}

                                                {rescheduleSlot && (
                                                    <button
                                                        onClick={handleReschedule}
                                                        disabled={rescheduleLoading}
                                                        className="w-full py-3 bg-primary-700 text-white rounded-xl font-black text-sm hover:bg-primary-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {rescheduleLoading ? 'Submitting...' : 'Request Reschedule'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {appointment.status === 'rescheduling' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                                        <Clock size={20} className="text-blue-600 mx-auto mb-2" />
                                        <p className="text-sm font-black text-blue-700">Waiting for Doctor Approval</p>
                                        <p className="text-xs font-bold text-blue-500 mt-1">
                                            Requested: {appointment.pendingReschedule?.date ? new Date(appointment.pendingReschedule.date).toLocaleDateString() : ''} at {appointment.pendingReschedule?.timeSlot}
                                        </p>
                                    </div>
                                )}

                                {appointment.status === 'expired' && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                                        <XCircle size={20} className="text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-black text-gray-600">Appointment Expired</p>
                                        <p className="text-xs font-bold text-gray-400 mt-1">No more reschedule attempts available. Please book a new appointment.</p>
                                        <Link to={`/doctors/${appointment.doctor?._id}`} className="inline-block mt-3 px-5 py-2.5 bg-primary-700 text-white rounded-xl text-xs font-black hover:bg-primary-800 transition-all">
                                            Book New Appointment
                                        </Link>
                                    </div>
                                )}

                                {/* Reschedule History */}
                                {appointment.rescheduleHistory?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Reschedule History</p>
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
                                    </div>
                                )}

                                {payment && (
                                    <button
                                        onClick={handlePrintInvoice}
                                        className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FileText size={16} />
                                        View Invoice
                                    </button>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Hidden Invoice for Print/PDF */}
                <div className="hidden">
                    <div ref={invoiceRef}>
                        <div className="header">
                            <div>
                                <div className="logo">Doctor<span>Link</span></div>
                                <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Healthcare Booking Platform</p>
                            </div>
                            <div className="invoice-title">
                                <h2>Invoice</h2>
                                <p>{invoiceNumber}</p>
                                <p style={{ marginTop: '2px' }}>
                                    {payment ? new Date(payment.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                </p>
                            </div>
                        </div>

                        <div className="parties">
                            <div className="party">
                                <h4>Billed To</h4>
                                <p className="name">{patient?.name}</p>
                                <p>{patient?.email}</p>
                                {patient?.phone && <p>{patient.phone}</p>}
                            </div>
                            <div className="party">
                                <h4>Provider</h4>
                                <p className="name">{doc?.fullName}</p>
                                <p>{doc?.specialization}</p>
                                {doc?.location && <p>{doc.location}</p>}
                            </div>
                        </div>

                        <div className="details-grid">
                            <div className="detail-item">
                                <h4>Appointment Date</h4>
                                <p>{appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="detail-item">
                                <h4>Time Slot</h4>
                                <p>{appointment.timeSlot}</p>
                            </div>
                            <div className="detail-item">
                                <h4>Status</h4>
                                <p>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</p>
                            </div>
                            <div className="detail-item">
                                <h4>Payment</h4>
                                <span className={`status-badge status-${appointment.paymentStatus}`}>
                                    {appointment.paymentStatus === 'paid' ? 'Paid' : appointment.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Details</th>
                                    <th className="amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 700 }}>Medical Consultation</td>
                                    <td>
                                        {doc?.fullName} — {doc?.specialization}<br />
                                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                            {appointmentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {appointment.timeSlot}
                                        </span>
                                    </td>
                                    <td className="amount">Rs. {(appointment.fee || 0).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="totals">
                            <div className="total-row">
                                <span>Consultation Fee</span>
                                <span>Rs. {(appointment.fee || 0).toLocaleString()}</span>
                            </div>
                            <div className="total-row">
                                <span>Platform Fee</span>
                                <span>Rs. {(payment?.patientPlatformFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="total-row final">
                                <span>Total Paid</span>
                                <span>Rs. {(payment ? payment.amount : appointment.fee || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {payment?.stripePaymentIntentId && (
                            <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', fontWeight: 800, marginBottom: '4px' }}>Transaction Reference</p>
                                <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#374151' }}>{payment.stripePaymentIntentId}</p>
                            </div>
                        )}

                        <div className="footer">
                            <p style={{ fontWeight: 700 }}>DoctorLink — Healthcare Booking Platform</p>
                            <p style={{ marginTop: '4px' }}>Thank you for choosing DoctorLink. This is a computer-generated invoice.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppointmentDetail;
