import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import ReceptionScene from '../3d/ReceptionScene';

const Hero = () => {
    return (
        <div className="relative min-h-[95vh] flex items-start lg:items-center pt-28 lg:pt-20 overflow-hidden bg-gradient-to-b from-primary-50 to-white">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-accent-100/20 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary-700 px-4 py-2 rounded-full font-bold text-sm mb-6 shadow-sm">
                            <Star className="w-4 h-4 fill-primary-700" size={16} />
                            <span>Virtual Reception Now Live</span>
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-tight mb-8 font-display tracking-tight">
                            Healthcare <br />
                            <span className="text-primary-700">Redefined.</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-lg font-bold leading-relaxed opacity-80">
                            Enter the future of clinical care through our interactive virtual lobby. Connect with specialists instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-20">
                            <button className="flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary-700/20">
                                Patient Login
                                <ArrowRight size={22} />
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-900 hover:border-primary-200 px-10 py-5 rounded-2xl font-black text-xl transition-all">
                                For Doctors
                            </button>
                        </div>

                        {/* Quick Trust Stats */}
                        <div className="grid grid-cols-3 gap-8 border-t border-gray-100 pt-10">
                            {[
                                { label: 'Active Doctors', val: '2.5k+' },
                                { label: 'Happy Patients', val: '50k+' },
                                { label: 'Success Rate', val: '98.9%' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-3xl font-black text-gray-900">{stat.val}</span>
                                    <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest mt-1">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 3D Reception Hub Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        <ReceptionScene />

                        {/* Experience Float Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute top-10 right-0 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white z-20 hidden lg:flex items-center gap-4"
                        >
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="text-emerald-700" size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-none">ISO 27001</p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">SECURE PORTAL</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
