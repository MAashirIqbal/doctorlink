import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Activity, LogOut, ArrowLeft,
    Users, Wallet, ClipboardList, Stethoscope, CheckCircle2,
    XCircle, AlertCircle, Phone, Mail, MapPin, CreditCard,
    FileText, DollarSign
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentDetail, acceptAppointment, rejectAppointment, completeAppointment } from '../../api/appointmentAPI';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments', active: true },
    { icon: Users, label: 'My Patients', path: '/doctor/patients' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertCircle, label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle, label: 'Cancelled' },
};

const DoctorAppointmentDetail = () => {
    const { user, logout } = useAuth();
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
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject this appointment?')) return;
        setActionLoading(true);
        try {
            await rejectAppointment(id, { reason: 'Rejected by doctor' });
            await fetchDetail();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const handleComplete = async () => {
        setActionLoading(true);
        try {
            await completeAppointment(id);
            await fetchDetail();
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
        setActionLoading(false);
    };

    const config = statusConfig[appointment?.status] || statusConfig.pending;

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
                            <img src={user.avatar} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
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
                                    <div className="flex gap-2">
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
                                            <button onClick={handleComplete} disabled={actionLoading} className="px-4 py-2 bg-primary-700 text-white rounded-xl text-xs font-black hover:bg-primary-800 transition-all disabled:opacity-50">
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Patient Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6"
                                >
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Patient Information</h3>
                                    <div className="flex items-start gap-4">
                                        {appointment.patient?.avatar ? (
                                            <img src={appointment.patient.avatar} alt={appointment.patient.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
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
        </div>
    );
};

export default DoctorAppointmentDetail;
