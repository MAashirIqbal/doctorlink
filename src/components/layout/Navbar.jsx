import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="text-xl font-bold text-gradient">Doctor Link</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <Link to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                                    className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                {user?.role === 'patient' && (
                                    <>
                                        <Link to="/doctors"
                                            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                            Find Doctors
                                        </Link>
                                        <Link to="/patient/appointments"
                                            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                            My Appointments
                                        </Link>
                                    </>
                                )}
                                {user?.role === 'doctor' && (
                                    <Link to="/doctor/profile"
                                        className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                        Profile
                                    </Link>
                                )}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {isDark ? '🌞' : '🌙'}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">{user?.name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/about"
                                    className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                    About
                                </Link>
                                <Link to="/contact"
                                    className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
                                    Contact
                                </Link>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {isDark ? '🌞' : '🌙'}
                                </button>
                                <Link to="/login">
                                    <Button variant="outline" size="sm">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t border-gray-200 dark:border-gray-800"
                >
                    <div className="px-4 py-4 space-y-3">
                        {isAuthenticated ? (
                            <>
                                <Link to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                                    className="block py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
                                    Dashboard
                                </Link>
                                {user?.role === 'patient' && (
                                    <>
                                        <Link to="/doctors" className="block py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
                                            Find Doctors
                                        </Link>
                                        <Link to="/patient/appointments" className="block py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
                                            My Appointments
                                        </Link>
                                    </>
                                )}
                                {user?.role === 'doctor' && (
                                    <Link to="/doctor/profile" className="block py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
                                        Profile
                                    </Link>
                                )}
                                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/about" className="block py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
                                    About
                                </Link>
                                <Link to="/contact" className="block py-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">
                                    Contact
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="w-full">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
