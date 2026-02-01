import React from 'react';
import { Search, Calendar, CreditCard, Shield } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: 'Find Doctors',
            desc: 'Browse through our extensive list of verified specialists near you.',
            icon: Search,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Quick Booking',
            desc: 'Book your appointment in just a few clicks with instant confirmation.',
            icon: Calendar,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Secure Payments',
            desc: 'Safe and encrypted payment processing for all your consultations.',
            icon: CreditCard,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Privacy First',
            desc: 'All your medical records and data are encrypted and strictly confidential.',
            icon: Shield,
            color: 'bg-red-100 text-red-600',
        },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base font-bold text-primary-600 tracking-wide uppercase">Core Features</h2>
                    <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Everything you need for better health.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-8 rounded-3xl border border-gray-100 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-100 transition-all duration-300 transform hover:-translate-y-2"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
