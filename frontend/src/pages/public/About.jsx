import React from 'react';
import { motion } from 'framer-motion';
import {
    Heart, Shield, Users, Target, Award, Zap,
    CheckCircle2, ArrowRight, Globe, Sparkles, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import medicalImage from '../../assets/medical_tech.png';
import consultationImage from '../../assets/consultation.png';

const stats = [
    { value: '6,000+', label: 'Verified Doctors', icon: Users },
    { value: '50,000+', label: 'Happy Patients', icon: Heart },
    { value: '99%', label: 'Satisfaction Rate', icon: Award },
    { value: '24/7', label: 'Platform Access', icon: Globe },
];

const values = [
    {
        icon: Shield,
        title: 'Trust & Safety',
        desc: 'Every doctor is PMC-verified. Every transaction is encrypted. Your health data is sacred to us.',
        gradient: 'from-emerald-100/80 to-emerald-50/30',
        color: 'bg-emerald-200 text-emerald-800'
    },
    {
        icon: Zap,
        title: 'Innovation First',
        desc: 'AI-powered symptom analysis, smart recommendations, and seamless digital prescriptions.',
        gradient: 'from-primary-100/80 to-primary-50/30',
        color: 'bg-primary-200 text-primary-800'
    },
    {
        icon: Heart,
        title: 'Patient-Centric',
        desc: 'Built around the patient journey — from finding the right specialist to post-consultation care.',
        gradient: 'from-accent-100/80 to-accent-50/30',
        color: 'bg-accent-200 text-accent-800'
    },
    {
        icon: Target,
        title: 'Accessibility',
        desc: 'Breaking geographical barriers to bring quality healthcare to every corner of Pakistan.',
        gradient: 'from-emerald-100/60 to-emerald-50/20',
        color: 'bg-emerald-100 text-emerald-900'
    },
];

const team = [
    { name: 'Muhammad Asad', role: 'Full-Stack Developer', reg: '22001256110', image: 'https://i.pravatar.cc/200?img=68' },
    { name: 'Muhammad Aashir Iqbal', role: 'Frontend Developer', reg: '22132256001', image: 'https://i.pravatar.cc/200?img=60' },
    { name: 'Umair Jamil', role: 'Backend Developer', reg: '22001256020', image: 'https://i.pravatar.cc/200?img=53' },
];

const About = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <section className="pt-28 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 font-black text-xs mb-6 uppercase tracking-widest border border-primary-200">
                                <Sparkles size={14} />
                                Our Story
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-8 font-display tracking-tight leading-[1.1]">
                                Reimagining Healthcare for <span className="text-primary-700">Pakistan</span>
                            </h1>
                            <p className="text-xl text-gray-600 font-bold leading-relaxed opacity-80 mb-10">
                                DoctorLink was born from a simple frustration — the gap between patients who need care and doctors who can provide it. We're building the bridge with technology, trust, and a relentless focus on the patient experience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary-700/20">
                                    Join DoctorLink
                                    <ArrowRight size={20} />
                                </Link>
                                <Link to="/doctors" className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-900 hover:border-primary-200 px-10 py-5 rounded-2xl font-black text-lg transition-all">
                                    Browse Doctors
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                <img src={medicalImage} alt="Medical Technology" className="w-full aspect-[4/3] object-cover" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                        <Activity size={24} className="text-emerald-700" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900 leading-none">FYP 2026</p>
                                        <p className="text-[10px] font-black text-primary-700 uppercase tracking-widest mt-1">University of Gujrat</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-16 bg-[#fafafa] border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                                    <stat.icon size={24} className="text-primary-700" />
                                </div>
                                <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                <img src={consultationImage} alt="Consultation" className="w-full aspect-[5/4] object-cover" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs mb-6 uppercase tracking-widest border border-emerald-200">
                                <Target size={14} />
                                Our Mission
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-8 font-display">
                                Making Quality Healthcare <span className="text-primary-700">Accessible</span>
                            </h2>
                            <p className="text-xl text-gray-600 font-bold leading-relaxed opacity-80 mb-10">
                                Our mission is to democratize healthcare access across Pakistan by connecting patients with verified specialists through a seamless, secure, and intelligent digital platform.
                            </p>
                            <ul className="space-y-5">
                                {[
                                    'Eliminate geographical barriers to specialist care',
                                    'Ensure every doctor on our platform is PMC-verified',
                                    'Provide secure, encrypted health data management',
                                    'Leverage AI for smarter healthcare recommendations'
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="flex items-center gap-4"
                                    >
                                        <CheckCircle2 className="text-primary-700 flex-shrink-0" size={22} />
                                        <span className="text-lg font-bold text-gray-700">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 font-bold text-sm mb-4 uppercase tracking-widest border border-primary-200">
                            <Zap size={16} />
                            Core Values
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                            What Drives <span className="text-primary-700">Us Forward</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`group p-10 rounded-3xl bg-gradient-to-br ${value.gradient} border border-white/50 hover:border-primary-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-900/5`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-[15deg] shadow-sm ${value.color}`}>
                                    <value.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 font-display leading-tight">{value.title}</h3>
                                <p className="text-gray-700 leading-relaxed text-lg font-bold opacity-70">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-4 uppercase tracking-widest border border-emerald-200">
                            <Users size={16} />
                            The Team
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                            Meet the <span className="text-primary-700">Builders</span>
                        </h2>
                        <p className="text-xl text-gray-600 font-bold opacity-70 max-w-2xl mx-auto">
                            A dedicated team from the University of Gujrat, Department of Information Technology.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
                        {team.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="text-center group"
                            >
                                <div className="relative inline-block mb-6">
                                    <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-gray-200/50 group-hover:shadow-primary-200/30 transition-shadow mx-auto">
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary-700 text-white p-2 rounded-xl shadow-lg">
                                        <CheckCircle2 size={16} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-1 font-display">{member.name}</h3>
                                <p className="text-primary-700 font-bold text-sm mb-2">{member.role}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.reg}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Supervisor */}
                    <div className="mt-16 text-center">
                        <div className="inline-block bg-gradient-to-r from-primary-50 to-emerald-50 rounded-3xl p-8 border border-primary-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supervised By</p>
                            <p className="text-xl font-black text-gray-900 font-display">Miss. Iram Shahzadi</p>
                            <p className="text-sm font-bold text-primary-700">Department of Information Technology, UoG</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-r from-primary-700 to-primary-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display tracking-tight">
                        Ready to Experience the Future?
                    </h2>
                    <p className="text-xl text-primary-100 font-bold mb-10 opacity-80 max-w-2xl mx-auto">
                        Join thousands of patients and doctors already using DoctorLink to transform healthcare.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="bg-white text-primary-900 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl">
                            Get Started Free
                        </Link>
                        <Link to="/apply-doctor" className="bg-white/10 border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all backdrop-blur-xl">
                            Join as Doctor
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
