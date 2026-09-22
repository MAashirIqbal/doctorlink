import React from 'react';
import { Search, Calendar, CreditCard, Shield, Zap, Heart, UserCheck, Smartphone } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: 'Verified Doctors',
            desc: 'Every doctor is PMC-verified and admin-approved before appearing on the platform.',
            icon: UserCheck,
            color: 'bg-emerald-200 text-emerald-800',
            gradient: 'from-emerald-100/80 to-emerald-50/30'
        },
        {
            title: 'Instant Booking',
            desc: 'Book in-person appointments directly from real-time doctor schedules — no phone calls needed.',
            icon: Calendar,
            color: 'bg-primary-200 text-primary-800',
            gradient: 'from-primary-100/80 to-primary-50/30'
        },
        {
            title: 'Secure Payments',
            desc: 'Pay online via Stripe with transparent fee breakdowns and instant confirmation.',
            icon: CreditCard,
            color: 'bg-accent-200 text-accent-800',
            gradient: 'from-accent-100/80 to-accent-50/30'
        },
        {
            title: 'Top Tier Security',
            desc: 'Bank-grade encryption keeps your personal and medical data fully private.',
            icon: Shield,
            color: 'bg-emerald-100 text-emerald-900',
            gradient: 'from-emerald-200/40 to-emerald-50/20'
        },
    ];

    return (
        <section className="py-24 bg-[#fafafa] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-4 uppercase tracking-widest border border-emerald-200">
                        <Zap size={16} />
                        Why Choose DoctorLink
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                        Innovative Care. <span className="text-primary-700">Exceptional Results.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`group p-10 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-white/50 hover:border-primary-200/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-900/5`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:rotate-[15deg] shadow-sm ${feature.color}`}>
                                <feature.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4 font-display leading-tight">{feature.title}</h3>
                            <p className="text-gray-700 leading-relaxed text-lg font-bold opacity-70">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
