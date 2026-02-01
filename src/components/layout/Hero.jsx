import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import heroImage from '../../assets/doctor_hero_new.png';

const Hero = () => {
    return (
        <div className="relative min-h-[90vh] flex items-start lg:items-center pt-28 lg:pt-20 overflow-hidden bg-gradient-to-b from-primary-50 to-white">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
                            <Star className="w-4 h-4 fill-primary-700" size={16} />
                            <span>Trusted by 50,000+ Patients</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-6 font-display">
                            Your Health, <br />
                            <span className="text-primary-700">Simplified.</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-lg font-bold leading-relaxed opacity-80">
                            Book appointments with premium doctors in seconds. Skip the waiting room and get the care you deserve.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary-700/20">
                                Book Appointment
                                <ArrowRight size={20} />
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-white border-2 border-primary-100 text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-2xl font-black text-lg transition-all">
                                Search Doctors
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-6">
                            {[
                                { icon: Clock, label: '24/7 Support', color: 'text-emerald-600' },
                                { icon: ShieldCheck, label: 'Secure Data', color: 'text-green-600' },
                                { icon: Star, label: 'Top Rated', color: 'text-primary-600' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className={`p-3 w-fit rounded-xl bg-white shadow-sm border border-gray-50 ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src={heroImage}
                                alt="Professional Doctor"
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Experience Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4 border border-primary-50"
                        >
                            <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="text-accent-700" size={28} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">15+</p>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Years Exp.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
