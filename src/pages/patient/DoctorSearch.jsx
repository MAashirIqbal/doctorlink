import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { doctorService } from '@/services';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const DoctorSearch = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        specialization: '',
        minFee: '',
        maxFee: '',
    });

    const specializations = [
        'All',
        'Cardiologist',
        'Dermatologist',
        'Neurologist',
        'Pediatrician',
        'Orthopedic',
        'Psychiatrist',
        'General Physician',
    ];

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const data = await doctorService.getDoctors(filters);
            setDoctors(data.doctors || []);
        } catch (error) {
            toast.error('Failed to load doctors');
            // Mock data for development
            setDoctors([
                {
                    _id: '1',
                    name: 'Dr. Sarah Johnson',
                    specialization: 'Cardiologist',
                    experience: 15,
                    fees: 500,
                    rating: 4.8,
                    image: null,
                },
                {
                    _id: '2',
                    name: 'Dr. Michael Chen',
                    specialization: 'Dermatologist',
                    experience: 10,
                    fees: 400,
                    rating: 4.6,
                    image: null,
                },
                {
                    _id: '3',
                    name: 'Dr. Emily Rodriguez',
                    specialization: 'Pediatrician',
                    experience: 12,
                    fees: 450,
                    rating: 4.9,
                    image: null,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleSearch = () => {
        fetchDoctors();
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        Find Your <span className="text-gradient">Perfect Doctor</span>
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        Search and filter through our network of qualified healthcare professionals
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Card>
                        <div className="grid md:grid-cols-4 gap-4">
                            <Input
                                placeholder="Search by name..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <select
                                className="input-field"
                                value={filters.specialization}
                                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                            >
                                {specializations.map((spec) => (
                                    <option key={spec} value={spec === 'All' ? '' : spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                            <Input
                                type="number"
                                placeholder="Min Fee"
                                value={filters.minFee}
                                onChange={(e) => handleFilterChange('minFee', e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Max Fee"
                                value={filters.maxFee}
                                onChange={(e) => handleFilterChange('maxFee', e.target.value)}
                            />
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleSearch} className="w-full md:w-auto">
                                🔍 Search Doctors
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Results */}
                {loading ? (
                    <Card>
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">Loading doctors...</p>
                        </div>
                    </Card>
                ) : doctors.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Try adjusting your filters
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor, index) => (
                            <motion.div
                                key={doctor._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full flex flex-col">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                                            👨‍⚕️
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-1">{doctor.name}</h3>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                {doctor.specialization}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="text-sm font-semibold">{doctor.rating || '4.5'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-text-muted-light dark:text-text-muted-dark">Experience:</span>
                                            <span className="font-semibold">{doctor.experience || 10} years</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-text-muted-light dark:text-text-muted-dark">Consultation Fee:</span>
                                            <span className="font-semibold text-primary">${doctor.fees || 500}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link to={`/doctors/${doctor._id}`} className="flex-1">
                                            <Button variant="outline" className="w-full">View Profile</Button>
                                        </Link>
                                        <Link to={`/book/${doctor._id}`} className="flex-1">
                                            <Button className="w-full">Book Now</Button>
                                        </Link>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSearch;
