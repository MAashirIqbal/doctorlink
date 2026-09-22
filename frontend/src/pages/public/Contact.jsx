import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { submitContactMessage } from '../../api/contactAPI';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await submitContactMessage(formData);
            setIsSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
        }
        setLoading(false);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: 'Call Us',
            detail: '+92 3XX XXXXXXX',
            sub: 'Mon-Sat, 9am to 6pm PKT',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            iconBg: 'bg-emerald-100'
        },
        {
            icon: Mail,
            title: 'Email Us',
            detail: 'support@doctorlink.pk',
            sub: 'We reply within 24 hours',
            color: 'bg-primary-50 text-primary-700 border-primary-100',
            iconBg: 'bg-primary-100'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            detail: 'University of Gujrat',
            sub: 'Faculty of Computing & IT',
            color: 'bg-accent-50 text-accent-600 border-accent-100',
            iconBg: 'bg-accent-100'
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <section className="pt-28 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-200/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 font-black text-xs mb-6 uppercase tracking-widest border border-primary-200">
                        <MessageCircle size={14} />
                        Get in Touch
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-display tracking-tight">
                        We'd Love to <span className="text-primary-700">Hear</span> From You
                    </h1>
                    <p className="text-xl text-gray-600 font-bold opacity-70 max-w-2xl mx-auto">
                        Have a question, feedback, or need assistance? Our team is here to help you navigate your healthcare journey.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {contactInfo.map((info, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 rounded-3xl border ${info.color} hover:-translate-y-1 transition-all duration-300`}
                            >
                                <div className={`w-14 h-14 ${info.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                                    <info.icon size={24} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 font-display">{info.title}</h3>
                                <p className="text-gray-900 font-black text-lg">{info.detail}</p>
                                <p className="text-gray-500 font-bold text-sm mt-1">{info.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form — Centered */}
            <section className="py-20 bg-[#fafafa]">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl shadow-gray-100/50">
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl font-black text-gray-900 mb-3 font-display tracking-tight">Send a Message</h2>
                                <p className="text-gray-500 font-bold">Fill out the form and our team will get back to you within 24 hours.</p>
                            </div>

                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4 font-bold">
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Your name"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="you@example.com"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="How can we help?"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us more about your inquiry..."
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all resize-none"
                                        />
                                    </div>

                                    <button disabled={loading} className="w-full bg-primary-700 hover:bg-primary-800 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-700/20 active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Send Message
                                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                                        <CheckCircle2 size={40} className="text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3 font-display">Message Sent!</h3>
                                    <p className="text-gray-500 font-bold mb-8 max-w-sm mx-auto">
                                        Thank you for reaching out. Our team will get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                                        className="px-8 py-3 bg-primary-50 text-primary-700 rounded-2xl font-black text-sm border border-primary-100 hover:bg-primary-100 transition-all"
                                    >
                                        Send Another Message
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
