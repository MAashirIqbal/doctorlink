import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Users } from 'lucide-react';
import aboutImage from '../../assets/consultation.png';

const AboutSection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Gradient Background Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 opacity-70" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src={aboutImage}
                                alt="Consultation"
                                className="w-full aspect-[6/5] object-cover"
                            />
                        </div>

                        {/* Interactive Stats Card */}
                        <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-2xl border border-primary-50 z-20 hidden md:block">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-emerald-100 rounded-2xl border border-emerald-200">
                                    <TrendingUp className="text-emerald-700" size={24} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900 leading-none">99%</p>
                                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">Satisfaction</p>
                                </div>
                            </div>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <img
                                        key={i}
                                        src={`https://i.pravatar.cc/100?img=${i + 20}`}
                                        className="w-10 h-10 rounded-full border-2 border-white"
                                        alt="User"
                                    />
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-700 flex items-center justify-center text-[10px] text-white font-black">
                                    +500
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm mb-6 uppercase tracking-widest border border-emerald-200">
                            <Users size={16} />
                            Modern Care
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-8 font-display">
                            A Personal Approach to <br />
                            <span className="text-primary-700">Digital Medicine.</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-10 font-bold leading-relaxed opacity-80">
                            We believe healthcare should be as seamless as ordering a specialty coffee. Our platform bridges the gap between traditional medicine and modern convenience.
                        </p>

                        <ul className="space-y-6">
                            {[
                                { title: 'No Registration Fees', desc: 'Patients can join and browse doctors for free.' },
                                { title: 'Real-Time Scheduling', desc: 'Book available slots directly from doctor calendars — no waiting or phone calls.' },
                                { title: 'Smart Notifications', desc: 'Get appointment reminders, booking confirmations, and status updates instantly.' }
                            ].map((item, id) => (
                                <motion.li
                                    key={id}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + (id * 0.1) }}
                                    className="flex items-start gap-4 group"
                                >
                                    <div className="mt-1">
                                        <CheckCircle2 className="text-primary-700 group-hover:scale-110 transition-transform" size={26} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 leading-tight mb-1">{item.title}</h4>
                                        <p className="text-gray-500 font-bold opacity-80">{item.desc}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="mt-12">
                            <button className="bg-primary-950 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-950/20 active:scale-95">
                                Learn More About Us
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
