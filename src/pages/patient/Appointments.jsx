import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Star, Search, Filter, User,
    Activity, LogOut,
    ChevronDown, X, CheckCircle2, XCircle, AlertCircle,
    ArrowRight, MessageCircle, RotateCcw, CreditCard
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../../api/appointmentAPI';
import { createReview } from '../../api/reviewAPI';
import { createCheckout, verifySession } from '../../api/paymentAPI';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: Calendar, label: 'My Appointments', path: '/patient/appointments', active: true },
    { icon: Search, label: 'Find Doctors', path: '/doctors' },
    { icon: User, label: 'My Profile', path: '/patient/profile' },
];

const statusConfig = {
    confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, label: 'Confirmed' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertCircle, label: 'Pending' },
    completed: { color: 'bg-primary-50 text-primary-700 border-primary-100', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle, label: 'Cancelled' },
};

const RatingModal = ({ isOpen, onClose, doctor, appointmentId, doctorId, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setSubmitting(true);
        try {
            await createReview({ doctor: doctorId, appointment: appointmentId, rating, comment: review });
            onSubmit?.();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        }
        setSubmitting(false);
    };

    if (!isOpen) return null;

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
                    className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100"
                >
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black text-gray-900 font-display mb-2">Rate Your Visit</h3>
                        <p className="text-gray-500 font-bold text-sm">How was your experience with {doctor}?</p>
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform hover:scale-125"
                            >
                                <Star
                                    size={36}
                                    className={`transition-colors ${(hover || rating) >= star
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-200'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Review Text */}
                    <textarea
                        rows={4}
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience (optional)..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all resize-none mb-6"
                    />

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                            className={`flex-[2] py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${rating > 0
                                ? 'bg-primary-700 text-white shadow-xl shadow-primary-700/20 hover:bg-primary-800 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Review'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const PatientAppointments = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingModal, setRatingModal] = useState({ open: false, doctor: '', appointmentId: '', doctorId: '' });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentBanner, setPaymentBanner] = useState('');

    const fetchAppointments = async () => {
        try {
            const params = activeTab !== 'all' ? { status: activeTab } : {};
            const { data } = await getMyAppointments(params);
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, [activeTab]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const payment = params.get('payment');
        const sessionId = params.get('session_id');

        if (payment === 'success' && sessionId) {
            // Verify the session with backend to update payment/appointment status
            const verify = async () => {
                try {
                    await verifySession({ sessionId });
                    setPaymentBanner('Payment successful! Your appointment is now confirmed.');
                } catch {
                    setPaymentBanner('Payment received. Updating your appointment...');
                }
                fetchAppointments();
            };
            verify();
            // Clean URL params
            navigate('/patient/appointments', { replace: true });
        } else if (payment === 'success') {
            setPaymentBanner('Payment successful! Your appointment is now confirmed.');
            fetchAppointments();
        } else if (payment === 'cancelled') {
            setPaymentBanner('Payment cancelled. You can try again from your appointments.');
        }
    }, [location.search]);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await cancelAppointment(id, { reason: 'Cancelled by patient' });
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const handleLogout = () => { localStorage.setItem('lastRole', 'patient'); logout(); navigate('/'); };

    const handlePayNow = async (appointmentId) => {
        try {
            const { data } = await createCheckout({ appointmentId });
            if (data?.url) {
                window.location.href = data.url;
                return;
            }
            alert('Failed to start checkout');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start checkout');
        }
    };

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'confirmed', label: 'Upcoming' },
        { key: 'pending', label: 'Pending' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    const filtered = appointments.filter(apt => {
        const matchesSearch = (apt.doctor?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (apt.doctor?.specialization || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    }).sort((a, b) => {
        // Active statuses first (pending, confirmed), then completed/cancelled
        const activeStatuses = ['pending', 'confirmed'];
        const aActive = activeStatuses.includes(a.status) ? 0 : 1;
        const bActive = activeStatuses.includes(b.status) ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        // Within same group, sort by date descending (newest first)
        return new Date(b.date) - new Date(a.date);
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
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">My Appointments</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Manage and track all your medical visits</p>
                        </div>
                        <Link to="/doctors" className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-primary-700/20 active:scale-95">
                            <Calendar size={16} />
                            Book New
                        </Link>
                    </div>
                </header>

                <div className="p-8">
                    {paymentBanner && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl px-5 py-4 font-bold">
                            {paymentBanner}
                        </div>
                    )}
                    {/* Tabs & Search */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50">
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
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                            />
                        </div>
                    </div>

                    {/* Appointment Cards */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                        ) : filtered.map((apt, i) => {
                            const config = statusConfig[apt.status] || statusConfig.pending;
                            return (
                                <motion.div
                                    key={apt._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row items-start gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl border-2 border-white shadow-md">
                                            {apt.doctor?.fullName?.[0] || 'D'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900">{apt.doctor?.fullName || 'Doctor'}</h3>
                                                    <p className="text-sm font-bold text-primary-700">{apt.doctor?.specialization}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
                                                    <config.icon size={12} />
                                                    {config.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500 mb-4">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-primary-600" />
                                                    {new Date(apt.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-primary-600" />
                                                    {apt.timeSlot}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-primary-600" />
                                                    {apt.doctor?.location || ''}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-6">
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee</span>
                                                        <p className="text-lg font-black text-gray-900">Rs. {(apt.fee || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</span>
                                                        <p className="text-sm font-black text-gray-700">{apt.paymentStatus || 'Pending'}</p>
                                                    </div>
                                                    {apt.paymentStatus === 'refunded' && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                                            <RotateCcw size={10} className="text-emerald-600" />
                                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Refunded</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {apt.status === 'completed' && (
                                                        <button
                                                            onClick={() => setRatingModal({ open: true, doctor: apt.doctor?.fullName, appointmentId: apt._id, doctorId: apt.doctor?._id })}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl font-black text-xs hover:bg-amber-100 transition-all"
                                                        >
                                                            <Star size={14} />
                                                            Rate Doctor
                                                        </button>
                                                    )}
                                                    {(apt.status === 'confirmed' || apt.status === 'pending') && (
                                                        <button
                                                            onClick={() => handleCancel(apt._id)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-xs hover:bg-red-100 transition-all"
                                                        >
                                                            <XCircle size={14} />
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {(apt.status === 'confirmed' || apt.status === 'pending') && apt.paymentStatus !== 'paid' && apt.paymentStatus !== 'refunded' && (
                                                        <button
                                                            onClick={() => handlePayNow(apt._id)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all"
                                                        >
                                                            <CreditCard size={14} />
                                                            Pay Now
                                                        </button>
                                                    )}
                                                    <Link to={`/doctors/${apt.doctor?._id}`} className="flex items-center gap-2 px-5 py-2.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-xl font-black text-xs hover:bg-primary-100 transition-all">
                                                        View Doctor
                                                        <ArrowRight size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50">
                                <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No appointments found</h3>
                                <p className="text-gray-500 font-bold mb-6">Try changing your filters or book a new appointment.</p>
                                <Link to="/doctors" className="inline-flex items-center gap-2 px-8 py-3 bg-primary-700 text-white rounded-2xl font-black text-sm hover:bg-primary-800 transition-all active:scale-95 shadow-lg shadow-primary-700/20">
                                    Find a Doctor <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Rating Modal */}
            <RatingModal
                isOpen={ratingModal.open}
                onClose={() => setRatingModal({ open: false, doctor: '', appointmentId: '', doctorId: '' })}
                doctor={ratingModal.doctor}
                appointmentId={ratingModal.appointmentId}
                doctorId={ratingModal.doctorId}
                onSubmit={fetchAppointments}
            />
        </div>
    );
};

export default PatientAppointments;
