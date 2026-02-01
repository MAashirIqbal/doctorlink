import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';

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
        { name: 'Doctors', path: '/doctors' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white shadow-md py-2 border-b border-gray-100'
                    : 'bg-white/90 backdrop-blur-sm py-4 border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-700 p-2 rounded-lg group-hover:scale-110 transition-transform shadow-sm">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                            Doctor<span className="text-primary-700">Link</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-gray-800 hover:text-primary-700 font-bold transition-colors text-[15px]"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="bg-primary-700 hover:bg-primary-800 text-white px-7 py-2.5 rounded-full font-bold transition-all hover:shadow-lg active:scale-95"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 animate-in fade-in slide-in-from-top duration-300">
                    <div className="px-4 pt-2 pb-8 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="block px-4 py-4 text-lg font-bold text-gray-900 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="block w-full text-center mt-4 bg-primary-700 text-white px-6 py-4 rounded-xl font-bold text-lg"
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
