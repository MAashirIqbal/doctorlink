import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Instagram, Twitter, Linkedin, Facebook, MapPin, Phone, Mail, ArrowRight, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-24 pb-12 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
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
                        <h4 className="text-lg font-black mb-8 font-display text-gray-900">Services</h4>
                        <ul className="space-y-4">
                            {['Find Specialists', 'Online Visit', 'Prescriptions', 'Emergency Care', 'Health Plans'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 font-bold opacity-70 hover:opacity-100 hover:text-primary-700 transition-all flex items-center gap-2 group">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-black mb-8 font-display text-gray-900">Company</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Safety First', 'How it Works', 'Privacy Policy', 'Contact Support'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-600 font-bold opacity-70 hover:opacity-100 hover:text-primary-700 transition-all flex items-center gap-2">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Integrated CTA in Footer */}
                    <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100/50">
                        <h4 className="text-xl font-black mb-4 font-display text-gray-900">Get Health Alerts</h4>
                        <p className="text-gray-600 font-bold text-sm mb-6 opacity-70">Stay updated with latest medical trends.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-white border border-emerald-100 rounded-2xl py-3.5 px-5 outline-none focus:border-primary-600 transition-all font-bold text-gray-900 shadow-sm"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary-700 hover:bg-primary-800 text-white px-3 rounded-xl transition-all shadow-lg shadow-primary-700/30">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                        <span>© 2026 DoctorLink Healthcare</span>
                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span>FYP Project</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                        Made with <Heart size={14} className="text-rose-400 fill-rose-400" /> by Antigravity
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
