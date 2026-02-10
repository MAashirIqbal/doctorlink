import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Star, MapPin, Clock, ArrowRight, X, ChevronDown, Stethoscope, Filter, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { getDoctors } from '../../api/doctorAPI';

const specializations = [
    "All Specializations", "Cardiologist", "Dermatologist", "Pediatrician",
    "Neurologist", "Orthopedic Surgeon", "General Physician",
    "Psychiatrist", "Gynecologist", "E.N.T Specialist", "Gastroenterologist",
    "Urologist", "Oncologist", "Ophthalmologist", "Dentist"
];

const DoctorCard = ({ doctor, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
    >
        <Link to={`/doctors/${doctor._id}`} className="block group">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-primary-200/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-2">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden bg-primary-50">
                    <img
                        src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&size=300&background=0a5c36&color=fff&bold=true`}
                        alt={doctor.fullName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Availability Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border ${doctor.isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${doctor.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {doctor.isAvailable ? 'Available' : 'Busy'}
                    </div>

                    {/* Rating on Image */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-white text-xs font-black">{doctor.rating}</span>
                        <span className="text-white/50 text-[10px] font-bold">({doctor.totalReviews})</span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 group-hover:text-primary-700 transition-colors leading-tight">
                                {doctor.fullName}
                            </h3>
                            <p className="text-primary-700 font-bold text-sm mt-1">{doctor.specialization}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500 text-xs font-bold mb-5">
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-primary-600" />
                            {doctor.experience} yrs exp
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-primary-600" />
                            {doctor.location}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultation</span>
                            <p className="text-xl font-black text-gray-900">Rs. {doctor.fee?.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center group-hover:bg-primary-800 transition-colors shadow-lg shadow-primary-700/20">
                            <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    </motion.div>
);

const Doctors = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('All Specializations');
    const [sortBy, setSortBy] = useState('rating');
    const [showFilters, setShowFilters] = useState(false);
    const [feeRange, setFeeRange] = useState([0, 10000]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const params = {
                    search: searchQuery || undefined,
                    specialization: selectedSpec !== 'All Specializations' ? selectedSpec : undefined,
                    maxFee: feeRange[1] < 10000 ? feeRange[1] : undefined,
                    sort: sortBy,
                    limit: 50,
                };
                const { data } = await getDoctors(params);
                setDoctors(data.doctors);
            } catch (err) {
                console.error('Failed to fetch doctors:', err);
            }
            setLoading(false);
        };
        const debounce = setTimeout(fetchDoctors, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, selectedSpec, sortBy, feeRange]);

    const filteredDoctors = doctors;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Header */}
            <section className="pt-28 pb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 font-black text-xs mb-6 uppercase tracking-widest border border-primary-200">
                            <Stethoscope size={14} />
                            Find Your Specialist
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 font-display tracking-tight">
                            Browse Top <span className="text-primary-700">Doctors</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-bold opacity-70 max-w-2xl mx-auto">
                            Connect with Pakistan's finest verified medical specialists. Filter by specialty, experience, and more.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-3 flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, specialty, or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-primary-200 focus:bg-white transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all ${showFilters
                                    ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                                    : 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200'
                                    }`}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                            </button>
                        </div>

                        {/* Expandable Filter Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8">
                                        <div className="grid md:grid-cols-3 gap-6">
                                            {/* Specialization */}
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Specialization</label>
                                                <select
                                                    value={selectedSpec}
                                                    onChange={(e) => setSelectedSpec(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all appearance-none cursor-pointer"
                                                >
                                                    {specializations.map(spec => (
                                                        <option key={spec} value={spec}>{spec}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sort By */}
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Sort By</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="rating">Highest Rated</option>
                                                    <option value="experience">Most Experienced</option>
                                                    <option value="fee-low">Fee: Low to High</option>
                                                    <option value="fee-high">Fee: High to Low</option>
                                                </select>
                                            </div>

                                            {/* Fee Range */}
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                                                    Max Fee: Rs. {feeRange[1].toLocaleString()}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="500"
                                                    max="10000"
                                                    step="500"
                                                    value={feeRange[1]}
                                                    onChange={(e) => setFeeRange([0, parseInt(e.target.value)])}
                                                    className="w-full accent-primary-700 mt-2"
                                                />
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                                                    <span>Rs. 500</span>
                                                    <span>Rs. 10,000</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Filters */}
                                        {(selectedSpec !== 'All Specializations' || searchQuery) && (
                                            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-50">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active:</span>
                                                {selectedSpec !== 'All Specializations' && (
                                                    <button
                                                        onClick={() => setSelectedSpec('All Specializations')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-black border border-primary-100"
                                                    >
                                                        {selectedSpec}
                                                        <X size={12} />
                                                    </button>
                                                )}
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-black border border-primary-100"
                                                    >
                                                        "{searchQuery}"
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-10">
                        <p className="text-gray-500 font-bold">
                            Showing <span className="text-gray-900 font-black">{filteredDoctors.length}</span> specialists
                        </p>
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-primary-600" />
                            <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">All PMC Verified</span>
                        </div>
                    </div>

                    {/* Doctor Grid */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
                                    <div className="h-56 bg-gray-100" />
                                    <div className="p-6 space-y-3">
                                        <div className="h-5 bg-gray-100 rounded-xl w-3/4" />
                                        <div className="h-4 bg-gray-50 rounded-xl w-1/2" />
                                        <div className="h-4 bg-gray-50 rounded-xl w-2/3" />
                                        <div className="h-6 bg-gray-100 rounded-xl w-1/3 mt-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredDoctors.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredDoctors.map((doctor, index) => (
                                <DoctorCard key={doctor._id} doctor={doctor} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 font-display">No specialists found</h3>
                            <p className="text-gray-500 font-bold max-w-md mx-auto">
                                Try adjusting your filters or search terms to find the right doctor for you.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedSpec('All Specializations'); setFeeRange([0, 10000]); }}
                                className="mt-6 px-8 py-3 bg-primary-700 text-white rounded-2xl font-black text-sm hover:bg-primary-800 transition-all active:scale-95"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Doctors;
