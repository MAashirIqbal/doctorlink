import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Activity, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'For Providers', path: '/apply-doctor' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'doctor') return '/doctor/dashboard';
        if (user.role === 'admin') return '/admin/dashboard';
        return '/patient/dashboard';
    };

    const getProfilePath = () => {
        if (!user) return '/login';
        if (user.role === 'doctor') return '/doctor/profile';
        return '/patient/profile';
    };

    const getLoginPath = () => {
        const lastRole = localStorage.getItem('lastRole');
        if (lastRole === 'doctor') return '/apply-doctor';
        return '/login';
    };

    const handleLogout = () => {
        localStorage.setItem('lastRole', user?.role || '');
        logout();
        setShowDropdown(false);
        navigate('/');
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white shadow-sm py-2.5 border-b border-gray-100'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary-700 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                            <Activity className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight font-display">
                            Doctor<span className="text-primary-700">Link</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-[15px] font-bold transition-all hover:text-primary-700 ${location.pathname === link.path ? 'text-primary-700' : 'text-gray-800'
                                    } hover:scale-105`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2.5 bg-primary-50 hover:bg-primary-100 border border-primary-100 px-4 py-2 rounded-2xl transition-all"
                                >
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary-700 rounded-xl flex items-center justify-center text-white text-xs font-black">
                                            {initials}
                                        </div>
                                    )}
                                    <span className="text-sm font-black text-gray-900 max-w-[120px] truncate">{user.name}</span>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 truncate">{user.email}</p>
                                            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">{user.role}</span>
                                        </div>
                                        <Link
                                            to={getDashboardPath()}
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                        >
                                            <LayoutDashboard size={16} className="text-gray-400" />
                                            Dashboard
                                        </Link>
                                        {user.role !== 'admin' && (
                                            <Link
                                                to={getProfilePath()}
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                            >
                                                <User size={16} className="text-gray-400" />
                                                My Profile
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all w-full"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={getLoginPath()}
                                className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all hover:shadow-lg active:scale-95 shadow-primary-700/10"
                            >
                                {localStorage.getItem('lastRole') ? 'Login' : 'Get Started'}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                                className="block px-4 py-4 text-lg font-black text-gray-900 hover:bg-primary-50 hover:text-primary-700 rounded-2xl transition-all"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <>
                                <Link
                                    to={getDashboardPath()}
                                    className="block px-4 py-4 text-lg font-black text-primary-700 hover:bg-primary-50 rounded-2xl transition-all"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="block w-full text-left px-4 py-4 text-lg font-black text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to={getLoginPath()}
                                className="block w-full text-center mt-4 bg-primary-700 text-white px-6 py-4 rounded-2xl font-black text-lg"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {localStorage.getItem('lastRole') ? 'Login' : 'Get Started'}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
