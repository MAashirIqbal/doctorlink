import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Activity, PhoneCall } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Specialists', path: '/doctors' },
        { name: 'Clinics', path: '/about' },
        { name: 'Services', path: '/contact' },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3'
                    : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="bg-primary-600 p-2 rounded-xl group-hover:rotate-[15deg] transition-all duration-300 shadow-lg shadow-primary-600/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900 font-display">
                            Doctor<span className="text-primary-600 underline decoration-emerald-200 decoration-4 underline-offset-4">Link</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        <div className="flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-[15px] font-bold text-gray-600 hover:text-primary-600 transition-colors tracking-wide"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="h-6 w-[1px] bg-gray-200" />

                        <div className="flex items-center gap-4">
                            <div className="hidden xl:flex items-center gap-3 mr-2">
                                <div className="p-2 bg-emerald-50 rounded-full">
                                    <PhoneCall className="text-primary-600 w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Emergency</p>
                                    <p className="text-sm font-black text-gray-900 leading-none">+1 800 555 123</p>
                                </div>
                            </div>
                            <Link
                                to="/login"
                                className="bg-primary-950 hover:bg-black text-white px-7 py-3 rounded-full font-bold text-[15px] transition-all active:scale-95 shadow-xl shadow-gray-200"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-900 bg-gray-50 rounded-lg"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-50 p-6 animate-in slide-in-from-top duration-300">
                    <div className="space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="block text-lg font-bold text-gray-900 border-b border-gray-50 pb-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="block w-full text-center bg-primary-600 text-white py-4 rounded-2xl font-bold text-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
