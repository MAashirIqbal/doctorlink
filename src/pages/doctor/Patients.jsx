import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, User, Search, Activity, LogOut,
    Users, Wallet, ClipboardList, Stethoscope, Phone, Mail,
    ChevronRight, Eye, MapPin, MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyPatients } from '../../api/doctorAPI';
import { resolveFileUrl } from '../../api/axios';

const sidebarLinks = [
    { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
    { icon: Users, label: 'My Patients', path: '/doctor/patients', active: true },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
    { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
    { icon: User, label: 'Profile', path: '/doctor/profile' },
];

const DoctorPatients = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getMyPatients();
                setPatients(data.patients || []);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const handleLogout = () => { localStorage.setItem('lastRole', 'doctor'); logout(); navigate('/'); };

    const filtered = patients.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
                <div className="p-6 border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-primary-700 p-2 rounded-xl shadow-sm">
                            <Activity className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight font-display text-gray-900">
                            Doctor<span className="text-primary-700">Link</span>
                        </span>
                    </Link>
                    <div className="mt-4 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 inline-flex items-center gap-1.5">
                        <Stethoscope size={12} className="text-emerald-700" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Doctor Portal</span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link, i) => (
                        <Link key={i} to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${link.active
                                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        {user?.avatar ? (
                            <img src={resolveFileUrl(user.avatar)} alt={user?.name} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm">{user?.name?.[0]}</div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-primary-700 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" /></button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">My Patients</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">View patients who have booked appointments with you</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-200 w-64 transition-all"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {/* Summary */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/60 shadow-sm shadow-gray-200/50 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
                                <Users size={22} className="text-primary-700" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{patients.length}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Patients</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient Cards */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" /></div>
                        ) : filtered.map((patient, i) => (
                            <motion.div
                                key={patient._id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="bg-white rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-6 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4 mb-5">
                                    {patient.avatar ? (
                                        <img src={resolveFileUrl(patient.avatar)} alt={patient.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg border-2 border-white shadow-md">{patient.name?.[0] || 'P'}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-gray-900 truncate">{patient.name}</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-0.5">
                                            <span>{patient.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone size={13} className="text-gray-300 flex-shrink-0" />
                                        <span className="font-bold text-gray-600">{patient.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail size={13} className="text-gray-300 flex-shrink-0" />
                                        <span className="font-bold text-gray-600 truncate">{patient.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin size={13} className="text-gray-300 flex-shrink-0" />
                                        <span className="font-bold text-gray-600">{patient.city || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visits</p>
                                            <p className="text-lg font-black text-primary-700">{patient.totalAppointments || 0}</p>
                                        </div>
                                        {patient.lastVisit && (
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Visit</p>
                                                <p className="text-sm font-black text-gray-600">{new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50">
                            <Users size={48} className="text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-gray-900 mb-2 font-display">No patients found</h3>
                            <p className="text-gray-500 font-bold">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DoctorPatients;
