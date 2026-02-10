import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, MapPin, CreditCard, ArrowLeft, ArrowRight,
    CheckCircle2, ShieldCheck, Star, Activity, Lock, User as UserIcon
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getDoctor, getDoctorSlots } from '../../api/doctorAPI';
import { createAppointment } from '../../api/appointmentAPI';
import { createCheckout } from '../../api/paymentAPI';
import { useAuth } from '../../context/AuthContext';

const parseSlotMinutes = (slot) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return h * 60 + m;
};

const isToday = (dateObj) => {
    const now = new Date();
    return dateObj.getFullYear() === now.getFullYear() &&
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getDate() === now.getDate();
};

const filterPastSlots = (slots, dateObj) => {
    if (!isToday(dateObj)) return slots;
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    return slots.filter(s => parseSlotMinutes(s) > nowMinutes);
};

const BookAppointment = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isBooked, setIsBooked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [payError, setPayError] = useState('');
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableDates, setAvailableDates] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [bookingResult, setBookingResult] = useState(null);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const { data } = await getDoctor(id);
                setDoctor(data.doctor);
                // Generate next 7 available dates from schedule
                const schedule = data.doctor.schedule || [];
                const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                const dates = [];
                const now = new Date();
                for (let i = 0; i < 14 && dates.length < 7; i++) {
                    const d = new Date(now);
                    d.setDate(d.getDate() + i);
                    const dayName = days[d.getDay()];
                    const sched = schedule.find(s => s.day === dayName);
                    if (sched && sched.isActive && sched.slots?.length > 0) {
                        const slots = filterPastSlots(sched.slots, d);
                        if (slots.length === 0) continue;
                        dates.push({
                            dateObj: d,
                            date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                            day: dayName.slice(0, 3),
                            full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                            slots,
                        });
                    }
                }
                setAvailableDates(dates);
            } catch (err) {
                console.error('Failed to load doctor:', err);
            }
            setLoading(false);
        };
        fetchDoctor();
    }, [id]);

    useEffect(() => {
        if (!selectedDate) return;
        const fetchBookedSlots = async () => {
            try {
                const { data } = await getDoctorSlots(id, { date: selectedDate.dateObj.toISOString() });
                const booked = data.bookedSlots || [];
                const available = filterPastSlots(
                    (selectedDate.slots || []).filter(s => !booked.includes(s)),
                    selectedDate.dateObj
                );
                setTimeSlots(available);
            } catch {
                setTimeSlots(filterPastSlots(selectedDate.slots || [], selectedDate.dateObj));
            }
        };
        fetchBookedSlots();
    }, [selectedDate, id]);

    const handlePayAndBook = async () => {
        setIsProcessing(true);
        setPayError('');
        try {
            const aptRes = await createAppointment({
                doctorId: doctor._id,
                date: selectedDate.dateObj.toISOString(),
                timeSlot: selectedTime,
            });
            const appointment = aptRes.data.appointment;

            const { data } = await createCheckout({ appointmentId: appointment._id });
            if (data?.url) {
                window.location.href = data.url;
                return;
            }
            throw new Error('Failed to create checkout session');
        } catch (err) {
            setPayError(err.response?.data?.message || 'Booking failed. Please try again.');
        }
        setIsProcessing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Doctor Not Found</h2>
                <Link to="/doctors" className="text-primary-700 font-bold hover:underline">Back to Doctors</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to={`/doctors/${doctor._id}`} className="flex items-center gap-2 text-gray-500 hover:text-primary-700 font-black text-sm transition-colors">
                        <ArrowLeft size={16} />
                        Back to Profile
                    </Link>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="bg-primary-700 p-1.5 rounded-lg">
                            <Activity className="text-white w-4 h-4" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-gray-900">
                            Doctor<span className="text-primary-700">Link</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Lock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Progress Steps */}
                {!isBooked && (
                    <div className="flex items-center justify-center gap-4 mb-12">
                        {[
                            { num: 1, label: 'Schedule' },
                            { num: 2, label: 'Payment & Checkout' },
                        ].map((s, i) => (
                            <React.Fragment key={s.num}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${step >= s.num
                                        ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                                        : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                                    </div>
                                    <span className={`text-sm font-black hidden sm:block ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < 1 && (
                                    <div className={`w-20 h-0.5 rounded-full ${step > s.num ? 'bg-primary-700' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* Step 1: Date & Time Selection */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Date Selection */}
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8">
                                        <h2 className="text-xl font-black text-gray-900 mb-2 font-display">Select Date</h2>
                                        <p className="text-sm font-bold text-gray-400 mb-6">Choose your preferred appointment date</p>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {availableDates.map((d, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                                    className={`flex-shrink-0 w-24 py-5 rounded-2xl text-center transition-all ${selectedDate?.date === d.date
                                                        ? 'bg-primary-700 text-white shadow-xl shadow-primary-700/20 scale-105'
                                                        : 'bg-gray-50 text-gray-700 border border-gray-100 hover:border-primary-200 hover:bg-primary-50'
                                                        }`}
                                                >
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedDate?.date === d.date ? 'text-primary-200' : 'text-gray-400'}`}>{d.day}</p>
                                                    <p className="text-lg font-black mt-1">{d.date.split(' ')[1]}</p>
                                                    <p className={`text-[10px] font-bold mt-0.5 ${selectedDate?.date === d.date ? 'text-primary-200' : 'text-gray-400'}`}>{d.date.split(' ')[0]}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    {selectedDate && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-3xl border border-gray-100 p-8"
                                        >
                                            <h2 className="text-xl font-black text-gray-900 mb-2 font-display">Select Time</h2>
                                            <p className="text-sm font-bold text-gray-400 mb-6">Available slots for {selectedDate.full}</p>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {timeSlots.map((slot, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedTime(slot)}
                                                        className={`py-4 rounded-2xl font-black text-sm transition-all ${selectedTime === slot
                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                            : 'bg-gray-50 text-gray-700 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50'
                                                            }`}
                                                    >
                                                        <Clock size={14} className="inline mr-1.5" />
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={() => selectedDate && selectedTime && setStep(2)}
                                        disabled={!selectedDate || !selectedTime}
                                        className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${selectedDate && selectedTime
                                            ? 'bg-primary-700 text-white shadow-xl shadow-primary-700/20 hover:bg-primary-800 active:scale-[0.98]'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Continue to Payment
                                        <ArrowRight size={20} />
                                    </button>
                                </div>

                                {/* Doctor Summary Sidebar */}
                                <div className="lg:col-span-1">
                                    <DoctorSummaryCard doctor={doctor} selectedDate={selectedDate} selectedTime={selectedTime} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Confirmation & Pay */}
                    {step === 2 && !isBooked && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
                                <div className="bg-gradient-to-r from-primary-700 to-primary-800 p-8 text-center">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl">
                                        <CheckCircle2 size={28} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white font-display">Confirm Your Appointment</h2>
                                    <p className="text-primary-200 font-bold text-sm mt-1">Review the details below and proceed to payment</p>
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
                                        {doctor.avatar ? (
                                            <img src={doctor.avatar} alt={doctor.fullName} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-2xl border-4 border-white shadow-lg">{doctor.fullName?.[0]}</div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 font-display">{doctor.fullName}</h3>
                                            <p className="text-sm font-bold text-primary-700">{doctor.specialization}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-black text-gray-700">{doctor.rating}</span>
                                                </div>
                                                {doctor.location && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                        <MapPin size={10} />
                                                        {doctor.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar size={14} className="text-primary-600" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{selectedDate?.full}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={14} className="text-primary-600" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{selectedTime}</p>
                                        </div>
                                    </div>

                                    {user && (
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserIcon size={14} className="text-primary-600" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking As</span>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{user.name}</p>
                                            <p className="text-xs font-bold text-gray-500">{user.email}</p>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="font-bold text-gray-500">Consultation Fee</span>
                                            <span className="font-black text-gray-900">Rs. {(doctor.fee || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="font-bold text-gray-500">Platform Fee</span>
                                            <span className="font-black text-emerald-600">Rs. 0</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between">
                                            <span className="font-black text-gray-900 uppercase tracking-wider text-sm">Total</span>
                                            <span className="text-2xl font-black text-primary-700">Rs. {(doctor.fee || 0).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {payError && (
                                        <div className="mb-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4 font-bold text-sm">
                                            {payError}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(1)} className="flex-1 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all">
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePayAndBook}
                                            disabled={isProcessing}
                                            className={`flex-[2] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${!isProcessing
                                                ? 'bg-[#635BFF] hover:bg-[#5851DB] text-white shadow-xl shadow-[#635BFF]/20 active:scale-[0.98]'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Redirecting to Stripe...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={18} />
                                                    Pay Now — Rs. {(doctor.fee || 0).toLocaleString()}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
                                        {[
                                            { icon: ShieldCheck, text: 'PMC Verified' },
                                            { icon: Lock, text: 'Stripe Secure' },
                                            { icon: ShieldCheck, text: '256-bit SSL' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-gray-400">
                                                <item.icon size={11} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Success */}
                    {isBooked && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xl shadow-gray-100/50">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                    className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100"
                                >
                                    <CheckCircle2 size={48} className="text-emerald-600" />
                                </motion.div>

                                <h2 className="text-3xl font-black text-gray-900 mb-3 font-display">Payment Successful!</h2>
                                <p className="text-gray-500 font-bold mb-8 max-w-md mx-auto">
                                    Your appointment with {doctor.fullName} has been confirmed. A confirmation email with receipt has been sent.
                                </p>

                                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Doctor', value: doctor.fullName },
                                            { label: 'Date', value: selectedDate?.full },
                                            { label: 'Time', value: selectedTime },
                                            { label: 'Amount Paid', value: `Rs. ${(doctor.fee || 0).toLocaleString()}` },
                                            { label: 'Payment', value: `Simulated Payment` },
                                            { label: 'Booking ID', value: bookingResult?._id?.slice(-8) || 'N/A' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                                <span className="text-xs font-bold text-gray-400">{item.label}</span>
                                                <span className="text-sm font-black text-gray-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link to="/patient/appointments" className="px-8 py-4 bg-primary-700 text-white rounded-2xl font-black hover:bg-primary-800 transition-all shadow-lg shadow-primary-700/20 active:scale-95">
                                        View My Appointments
                                    </Link>
                                    <Link to="/doctors" className="px-8 py-4 bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-100 transition-all">
                                        Browse More Doctors
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const DoctorSummaryCard = ({ doctor, selectedDate, selectedTime }) => (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden sticky top-24">
        <div className="p-6 border-b border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Booking With</p>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xl border-2 border-white shadow-md">{doctor.fullName?.[0]}</div>
                <div>
                    <h3 className="font-black text-gray-900">{doctor.fullName}</h3>
                    <p className="text-sm font-bold text-primary-700">{doctor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-gray-700">{doctor.rating}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
                <MapPin size={14} className="text-primary-600 flex-shrink-0" />
                <span className="font-bold text-gray-600">{doctor.location}</span>
            </div>
            {selectedDate && (
                <div className="flex items-center gap-3 text-sm">
                    <Calendar size={14} className="text-primary-600 flex-shrink-0" />
                    <span className="font-bold text-gray-600">{selectedDate.full}</span>
                </div>
            )}
            {selectedTime && (
                <div className="flex items-center gap-3 text-sm">
                    <Clock size={14} className="text-primary-600 flex-shrink-0" />
                    <span className="font-bold text-gray-600">{selectedTime}</span>
                </div>
            )}
            <div className="pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Consultation Fee</span>
                    <span className="text-xl font-black text-gray-900">Rs. {(doctor.fee || 0).toLocaleString()}</span>
                </div>
            </div>
        </div>
        <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-50">
                {[
                    { icon: ShieldCheck, text: 'PMC Verified' },
                    { icon: Lock, text: 'Encrypted' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-gray-400">
                        <item.icon size={11} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default BookAppointment;
