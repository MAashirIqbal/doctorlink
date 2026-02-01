import React, { useState } from 'react';
import { Search, Calendar, Shield, Zap, UserCheck, Smartphone } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import HealthPod from '../3d/HealthPod';

const Features = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const features = [
        {
            title: 'Expert Matching',
            desc: 'Our AI finds the perfect specialist for your specific symptoms and history.',
            icon: UserCheck,
            color: 'bg-emerald-200 text-emerald-800',
            gradient: 'from-emerald-100/80 to-emerald-50/30 shadow-emerald-900/5'
        },
        {
            title: 'Instant Booking',
            desc: 'Direct integration with doctor schedules means no more back-and-forth calls.',
            icon: Calendar,
            color: 'bg-primary-200 text-primary-800',
            gradient: 'from-primary-100/80 to-primary-50/30 shadow-primary-900/5'
        },
        {
            title: 'Digital Health',
            desc: 'Access your prescriptions and medical history anywhere, anytime on any device.',
            icon: Smartphone,
            color: 'bg-accent-200 text-accent-800',
            gradient: 'from-accent-100/80 to-accent-50/30 shadow-accent-900/5'
        },
        {
            title: 'Top Tier Security',
            desc: 'Bank-grade encryption ensures your private data stays private.',
            icon: Shield,
            color: 'bg-emerald-100 text-emerald-900',
            gradient: 'from-emerald-200/40 to-emerald-50/20 shadow-primary-900/5'
        },
    ];

    return (
        <section className="py-24 bg-[#fafafa] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-4 uppercase tracking-widest border border-emerald-200">
                        <Zap size={16} />
                        Why Choose DoctorLink
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                        Innovative Care. <span className="text-primary-700">Exceptional Results.</span>
                    </h2>
                </div>

                {/* 3D Health Pod Integration */}
                <HealthPod activeIndex={activeIndex} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {features.map((feature, idx) => (
                        <Tilt
                            key={idx}
                            tiltMaxAngleX={15}
                            tiltMaxAngleY={15}
                            perspective={1000}
                            scale={1.05}
                            transitionSpeed={1500}
                            gyroscope={true}
                            className="h-full"
                        >
                            <div
                                onMouseEnter={() => setActiveIndex(idx)}
                                onMouseLeave={() => setActiveIndex(null)}
                                className={`h-full group p-10 rounded-[2.5rem] bg-gradient-to-br ${feature.gradient} border border-white/50 hover:border-primary-200/50 transition-all duration-500 transform shadow-xl`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:rotate-[15deg] shadow-sm ${feature.color}`}
                                    style={{ transform: 'translateZ(50px)' }}
                                >
                                    <feature.icon size={32} />
                                </div>
                                <h3
                                    className="text-2xl font-black text-gray-900 mb-4 font-display leading-tight"
                                    style={{ transform: 'translateZ(30px)' }}
                                >
                                    {feature.title}
                                </h3>
                                <p
                                    className="text-gray-700 leading-relaxed text-lg font-bold opacity-70"
                                    style={{ transform: 'translateZ(20px)' }}
                                >
                                    {feature.desc}
                                </p>
                            </div>
                        </Tilt>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
