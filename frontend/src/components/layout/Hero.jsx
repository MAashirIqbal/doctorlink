import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck, User, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/doctor_hero_new.png';

const FloatingCard = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
        }}
        transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
            opacity: { duration: 0.8, delay: delay },
            scale: { duration: 0.8, delay: delay }
        }}
        className={`absolute z-30 pointer-events-none ${className}`}
    >
        {children}
    </motion.div>
);

const Hero = () => {
    return (
        <div className="relative min-h-[90vh] flex items-start lg:items-center pt-28 lg:pt-20 overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary-200/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-5 py-2 rounded-full font-black text-xs mb-8 uppercase tracking-widest border border-primary-200">
                            <Star className="w-3.5 h-3.5 fill-primary-700" />
                            <span>Premium Specialist Network</span>
                        </div>

                        <h1 className="text-6xl lg:text-[5.5rem] font-black text-gray-900 leading-[1.05] mb-8 font-display tracking-tight">
                            Healthcare <br />
                            <span className="text-primary-700">Refined.</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-lg font-bold leading-relaxed opacity-70">
                            Book appointments with world-class specialists in seconds. Our platform connects you with verified expertise, instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-14">
                            <Link to="/register" className="flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary-700/20">
                                Find a Specialist
                                <ArrowRight size={22} />
                            </Link>
                            <Link to="/apply-doctor" className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-900 hover:border-primary-200 px-10 py-5 rounded-2xl font-black text-lg transition-all text-center">
                                For Providers
                            </Link>
                        </div>

                        {/* Quick Trust Stats */}
                        <div className="flex gap-12 border-t border-gray-100 pt-10">
                            {[
                                { icon: Clock, label: 'Fast Access', val: '24/7' },
                                { icon: ShieldCheck, label: 'Secure Data', val: '100%' },
                                { icon: User, label: 'Verified', val: '5k+' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-2xl font-black text-gray-900 leading-none">{stat.val}</span>
                                    <span className="text-[10px] font-black text-primary-700 uppercase tracking-[0.2em]">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Visual Side - Floating Layers */}
                    <div className="relative">
                        {/* Main Image Frame */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border-4 border-white aspect-[4/5] lg:aspect-auto"
                        >
                            <img
                                src={heroImage}
                                alt="Professional Doctor"
                                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                            />
                            {/* Inner Glass Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/10 to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Specialist Card (Floats independently) */}
                        <FloatingCard
                            className="top-10 -left-12 lg:-left-20"
                            delay={0.2}
                        >
                            <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                    <CalendarCheck className="text-emerald-700" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 leading-none">Flexible Booking</p>
                                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 uppercase tracking-wider">Easy Rescheduling</p>
                                </div>
                            </div>
                        </FloatingCard>

                        {/* Rating Card */}
                        <FloatingCard
                            className="bottom-20 -right-4 sm:-right-6 lg:-right-8"
                            delay={0.5}
                        >
                            <div className="bg-primary-950/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-primary-900/20 border border-primary-800 flex flex-col gap-3 text-white">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-emerald-400 text-emerald-400" />)}
                                </div>
                                <div>
                                    <p className="text-lg font-black leading-none">4.9 / 5.0</p>
                                    <p className="text-[10px] text-primary-200/60 font-medium mt-1 uppercase tracking-widest">Patient Satisfaction</p>
                                </div>
                            </div>
                        </FloatingCard>

                        {/* Security Tag */}
                        <FloatingCard
                            className="-top-6 right-10"
                            delay={1.2}
                        >
                            <div className="bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-black text-xs uppercase tracking-widest">
                                <ShieldCheck size={18} />
                                HIPAA Compliant
                            </div>
                        </FloatingCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
