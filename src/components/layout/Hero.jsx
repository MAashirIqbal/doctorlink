import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck, Search, Calendar, CheckCircle } from 'lucide-react';
import heroImage from '../../assets/doctor_hero_new.png';

const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#fafafa]">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-100/30 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23064e3b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Trusted Badge */}
                        <div className="inline-flex items-center gap-3 bg-white border border-primary-100 p-1.5 pr-4 rounded-full shadow-sm mb-8">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Patient" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[10px] text-white font-bold">
                                    50k+
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-1">
                                <div className="flex text-accent-500">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Top Rated Care</span>
                            </div>
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-[1.05] tracking-tight mb-8">
                            Your Health, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-500">
                                Simplified.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed font-medium">
                            Experience the future of healthcare. Book world-class medical professionals in under 60 seconds.
                        </p>

                        {/* Integrated Search Bar */}
                        <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-primary-900/5 border border-gray-100 flex flex-col sm:flex-row gap-2 mb-10 max-w-xl">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3">
                                <Search className="text-primary-600" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by specialty or doctor name..."
                                    className="w-full outline-none text-gray-700 font-medium placeholder:text-gray-400"
                                />
                            </div>
                            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-full font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-600/20 whitespace-nowrap">
                                Find Doctor
                            </button>
                        </div>

                        {/* Dynamic Stats Row */}
                        <div className="flex flex-wrap gap-8 items-center border-t border-gray-100 pt-8">
                            {[
                                { label: 'Active Doctors', value: '450+', sub: 'Verified' },
                                { label: 'Monthly Patients', value: '12k+', sub: 'Satisfied' },
                                { label: 'Response Time', value: '< 2m', sub: 'Instant' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-2xl font-black text-gray-900 mb-0.5">{stat.value}</p>
                                    <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Visuals */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative z-10"
                        >
                            {/* Main Image Container */}
                            <div className="relative rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-gray-200">
                                <img
                                    src={heroImage}
                                    alt="Premium Healthcare"
                                    className="w-full aspect-[4/5] object-cover transition-transform duration-[2s] hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Element 1: Appointment Slot */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-8 -right-8 glass-card p-5 rounded-3xl shadow-xl z-20 hidden sm:block w-52"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                                        <Calendar className="text-accent-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Today</p>
                                        <p className="text-sm font-black text-gray-900">02:30 PM</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors">
                                    Book Now
                                </button>
                            </motion.div>

                            {/* Floating Element 2: Verified Doctor */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-8 -left-8 glass-card py-4 px-6 rounded-[2rem] shadow-xl z-20 flex items-center gap-4 animate-in fade-in slide-in-from-left duration-1000"
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                        <img src="https://i.pravatar.cc/100?img=12" alt="Doc" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                        <CheckCircle className="text-white" size={12} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-gray-900 leading-tight">Dr. James Wilson</p>
                                    <p className="text-sm font-semibold text-primary-600">Cardiologist Specialist</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Background blobs for image */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-600/5 rounded-full blur-[80px] -z-10" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
