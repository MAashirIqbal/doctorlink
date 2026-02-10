import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Star, MapPin, Clock, Calendar, ArrowLeft, ShieldCheck, Award,
    Phone, Mail, CheckCircle2, Heart, Share2, MessageCircle,
    ChevronRight, Briefcase, GraduationCap, Languages, ThumbsUp
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getDoctor, getDoctorSlots } from '../../api/doctorAPI';
import { getDoctorReviews } from '../../api/reviewAPI';

const parseSlotHour = (slot) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return h * 60 + m;
};

const getUpcomingSchedule = (schedule) => {
    if (!schedule || !schedule.length) return [];
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const result = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const dayName = days[d.getDay()];
        const sched = schedule.find(s => s.day === dayName);
        if (sched && sched.isActive && sched.slots?.length > 0) {
            const isToday = i === 0;
            const slots = isToday
                ? sched.slots.filter(s => parseSlotHour(s) > nowMinutes)
                : sched.slots;
            if (slots.length > 0) {
                result.push({
                    day: dayName,
                    date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                    dateObj: d,
                    slots,
                    isToday,
                });
            }
        }
    }
    return result;
};

const DoctorProfile = () => {
    const { id } = useParams();
    const [isFavorited, setIsFavorited] = useState(false);
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduleDisplay, setScheduleDisplay] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docRes, revRes] = await Promise.all([
                    getDoctor(id),
                    getDoctorReviews(id),
                ]);
                const doc = docRes.data.doctor;
                setDoctor(doc);
                setReviews(revRes.data.reviews);

                // Build schedule with booked slots filtered out
                const upcoming = getUpcomingSchedule(doc.schedule);
                const withBooked = await Promise.all(
                    upcoming.map(async (entry) => {
                        try {
                            const { data } = await getDoctorSlots(id, { date: entry.dateObj.toISOString() });
                            const booked = data.bookedSlots || [];
                            const available = entry.slots.filter(s => !booked.includes(s));
                            return { ...entry, slots: available };
                        } catch {
                            return entry;
                        }
                    })
                );
                setScheduleDisplay(withBooked.filter(e => e.slots.length > 0));
            } catch (err) {
                console.error('Failed to load doctor:', err);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa]">
                <Navbar />
                <div className="flex items-center justify-center pt-40">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-[#fafafa]">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-40">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Doctor Not Found</h2>
                    <Link to="/doctors" className="text-primary-700 font-bold hover:underline">Back to Doctors</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Navbar />

            {/* Breadcrumb */}
            <div className="pt-24 pb-4 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <Link to="/doctors" className="hover:text-primary-700 transition-colors flex items-center gap-1">
                            <ArrowLeft size={14} />
                            All Doctors
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-900">{doctor.fullName}</span>
                    </div>
                </div>
            </div>

            {/* Doctor Header */}
            <section className="bg-white pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Doctor Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-gray-200/50">
                                <img src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&size=400&background=0a5c36&color=fff&bold=true`} alt={doctor.fullName} className="w-full h-full object-cover" />
                            </div>
                            {doctor.pmcNumber && (
                                <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-500/30">
                                    <ShieldCheck size={20} />
                                </div>
                            )}
                        </motion.div>

                        {/* Doctor Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex-1"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 font-display tracking-tight">{doctor.fullName}</h1>
                                        {doctor.isAvailable && (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                                Available Today
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-primary-700 font-bold text-lg mb-1">{doctor.specialization}</p>
                                    <p className="text-gray-500 font-bold text-sm">{doctor.degree}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsFavorited(!isFavorited)}
                                        className={`p-3 rounded-2xl border transition-all ${isFavorited
                                            ? 'bg-red-50 border-red-100 text-red-500'
                                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
                                            }`}
                                    >
                                        <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
                                    </button>
                                    <button className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-primary-700 hover:bg-primary-50 transition-all">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-6 mt-8">
                                {[
                                    { icon: Star, label: 'Rating', value: `${doctor.rating} (${doctor.totalReviews} reviews)`, color: 'text-amber-500' },
                                    { icon: Briefcase, label: 'Experience', value: `${doctor.experience} Years`, color: 'text-primary-700' },
                                    { icon: MapPin, label: 'Location', value: doctor.location, color: 'text-emerald-600' },
                                    { icon: ThumbsUp, label: 'Patients', value: `${(doctor.totalPatients || 0).toLocaleString()}+`, color: 'text-primary-700' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                                        <stat.icon size={18} className={stat.color} />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-sm font-black text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <section className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Left Column - About & Reviews */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl p-8 border border-gray-200/60 shadow-sm shadow-gray-200/50"
                            >
                                <h2 className="text-xl font-black text-gray-900 mb-5 font-display uppercase tracking-tight">About</h2>
                                <p className="text-gray-600 font-bold leading-relaxed opacity-80">{doctor.about || 'No bio available.'}</p>

                                <div className="grid sm:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
                                            <GraduationCap size={22} className="text-primary-700" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Education</p>
                                            <p className="text-sm font-black text-gray-900">{doctor.degree || 'MBBS'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                                            <Languages size={22} className="text-emerald-700" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Languages</p>
                                            <p className="text-sm font-black text-gray-900">{(doctor.languages || []).join(', ') || 'English, Urdu'}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Reviews */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-8 border border-gray-200/60 shadow-sm shadow-gray-200/50"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Patient Reviews</h2>
                                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                                        <Star size={14} className="fill-amber-500 text-amber-500" />
                                        <span className="text-sm font-black text-amber-700">{doctor.rating}</span>
                                        <span className="text-xs font-bold text-amber-500">/ 5.0</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {reviews.length > 0 ? reviews.map((review, i) => (
                                        <div key={review._id || i} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-primary-50/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm text-primary-700 font-black text-sm">
                                                    {review.patient?.name?.[0] || 'P'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-black text-gray-900">{review.patient?.name || 'Patient'}</h4>
                                                            <p className="text-xs font-bold text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[...Array(review.rating)].map((_, j) => (
                                                                <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 font-bold leading-relaxed opacity-80 text-sm">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 font-bold text-center py-8">No reviews yet</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Schedule & Booking Card (Sticky) */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-3xl border border-gray-100 overflow-hidden sticky top-24 shadow-xl shadow-gray-100/50"
                            >
                                {/* Fee Header */}
                                <div className="bg-gradient-to-r from-primary-700 to-primary-800 p-5 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mb-0.5">Consultation Fee</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-black">Rs. {doctor.fee?.toLocaleString()}</span>
                                                <span className="text-primary-200 font-bold text-xs">/ visit</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Calendar size={18} className="text-primary-200" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {/* Available Schedule - Read Only */}
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Schedule</p>

                                    <div className="space-y-2.5 mb-5">
                                        {scheduleDisplay.map((dateObj, i) => (
                                            <div key={i} className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/80">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100 uppercase tracking-wider">{dateObj.day.slice(0, 3)}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">{dateObj.date}</span>
                                                    {dateObj.isToday && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Today</span>}
                                                    <span className="ml-auto text-[10px] font-black text-emerald-600">{dateObj.slots.length} slots</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {dateObj.slots.map((slot, j) => (
                                                        <span key={j} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-[11px] font-bold text-gray-600 border border-gray-100">
                                                            <Clock size={9} className="text-gray-400" />
                                                            {slot}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {scheduleDisplay.length === 0 && (
                                            <p className="text-sm font-bold text-gray-400 text-center py-4">No upcoming slots available</p>
                                        )}
                                    </div>

                                    {/* Book Button */}
                                    <Link
                                        to={`/book-appointment/${doctor._id}`}
                                        className="block w-full py-4 rounded-2xl font-black text-base text-center bg-primary-700 hover:bg-primary-800 text-white shadow-xl shadow-primary-700/20 active:scale-95 transition-all"
                                    >
                                        Book Appointment
                                    </Link>

                                    {/* Trust Indicators */}
                                    <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-gray-50">
                                        {[
                                            { icon: ShieldCheck, text: 'PMC Verified' },
                                            { icon: CheckCircle2, text: 'Secure Payment' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-gray-400">
                                                <item.icon size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default DoctorProfile;
