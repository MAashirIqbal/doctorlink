import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Instagram, Twitter, Linkedin, Facebook, MapPin, Phone, Mail, ArrowRight, Heart, ShieldCheck, Lock, CheckCircle } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="bg-primary-700 p-2 rounded-xl shadow-lg shadow-primary-700/20">
                                <Activity className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tight font-display text-gray-900">
                                Doctor<span className="text-primary-700">Link</span>
                            </span>
                        </Link>
                        <p className="text-gray-600 font-bold leading-relaxed opacity-70">
                            The future of healthcare is digital. We connect you with verified specialists instantly.
                        </p>

                        {/* Trust Badges - Improved Professionalism */}
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                <ShieldCheck size={14} className="text-emerald-700" />
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider leading-none">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
                                <Lock size={14} className="text-primary-700" />
                                <span className="text-[10px] font-black text-primary-800 uppercase tracking-wider leading-none">Encrypted</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 bg-gray-50 border border-gray-100 text-gray-400 hover:text-primary-700 hover:bg-primary-50 hover:border-primary-100 rounded-xl flex items-center justify-center transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-black mb-8 font-display text-gray-900 uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4">
                            {['Find Specialists', 'AI Symptom Analyzer', 'Specialist Portal', 'Patient Dashboard'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 font-bold opacity-70 hover:opacity-100 hover:text-primary-700 transition-all flex items-center gap-2">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-black mb-8 font-display text-gray-900 uppercase tracking-widest">Support</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Safety Protocols', 'How it Works', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 font-bold opacity-70 hover:opacity-100 hover:text-primary-700 transition-all flex items-center gap-2">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-black mb-8 font-display text-gray-900 uppercase tracking-widest">Contact</h4>
                        <div className="space-y-4 text-gray-600 font-bold opacity-70 italic text-sm">
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-primary-700" />
                                <span>+92 3XX XXXXXXX</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-primary-700" />
                                <span>support@doctorlink.pk</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Centered & Clean */}
                <div className="pt-8 border-t border-gray-100 flex justify-center text-center">
                    <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-[0.4em]">
                        <span>© 2026 DOCTORLINK HEALTHCARE</span>
                        <div className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full animate-pulse" />
                        <span>FINAL YEAR UNIVERSITY PROJECT</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
