import React from 'react';
import { Search, CalendarDays, ClipboardCheck, ArrowRight } from 'lucide-react';

const ProcessSection = () => {
    const steps = [
        {
            id: '01',
            title: 'Search Specialists',
            desc: 'Browse our directory of top-rated doctors by specialty or location.',
            icon: Search,
            iconColor: 'text-emerald-700',
            borderColor: 'border-emerald-100',
            link: 'Find a specialist'
        },
        {
            id: '02',
            title: 'Pick a Time',
            desc: 'Select a slot that fits your schedule from the live calendar.',
            icon: CalendarDays,
            iconColor: 'text-primary-700',
            borderColor: 'border-primary-100',
            link: 'View calendar'
        },
        {
            id: '03',
            title: 'Visit Your Doctor',
            desc: 'Attend your confirmed appointment at the doctor\'s clinic hassle-free.',
            icon: ClipboardCheck,
            iconColor: 'text-accent-600',
            borderColor: 'border-accent-100',
            link: 'Get started'
        }
    ];

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-800 font-black tracking-widest uppercase text-xs mb-4 border border-primary-200">
                        How it Works
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight font-display">
                        Your journey to better health starts <span className="text-primary-700">here.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-16">
                    {steps.map((step, i) => (
                        <div key={i} className="relative group">
                            {/* Step Number - Highly visible but elegant */}
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-5xl font-black text-emerald-100 group-hover:text-primary-700/20 transition-colors duration-500 font-display">
                                    {step.id}
                                </span>
                                <div className="h-[2px] flex-1 bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-700 w-0 group-hover:w-full transition-all duration-700" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 ${step.borderColor} bg-white shadow-sm group-hover:shadow-lg group-hover:scale-110 transition-all duration-500`}>
                                    <step.icon className={step.iconColor} size={28} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 font-display leading-tight">{step.title}</h3>
                                <p className="text-gray-600 text-lg font-bold leading-relaxed mb-8 opacity-70">
                                    {step.desc}
                                </p>
                                <div className="inline-flex items-center gap-2 text-primary-700 font-black text-base hover:gap-4 transition-all cursor-pointer group/link">
                                    {step.link}
                                    <ArrowRight size={20} className="group-hover/link:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProcessSection;
