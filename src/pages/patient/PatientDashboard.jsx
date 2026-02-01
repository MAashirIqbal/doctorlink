import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentService.getMyAppointments();
            setAppointments(data.appointments || []);
        } catch (error) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const upcomingAppointments = appointments.filter(
        (apt) => apt.status === 'confirmed' && new Date(apt.date) > new Date()
    );

    const stats = [
        { label: 'Upcoming', value: upcomingAppointments.length, color: 'text-primary' },
        { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'text-status-success' },
        { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'text-status-error' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, <span className="text-gradient">{user?.name}</span>!
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        Here's your health dashboard overview
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <div className="text-center">
                                    <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-text-secondary-light dark:text-text-secondary-dark">
                                        {stat.label} Appointments
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <Card>
                        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Link to="/doctors">
                                <Button className="w-full">
                                    🔍 Find a Doctor
                                </Button>
                            </Link>
                            <Link to="/patient/appointments">
                                <Button variant="outline" className="w-full">
                                    📅 View All Appointments
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>

                {/* Upcoming Appointments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
                    {loading ? (
                        <Card>
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
                            </div>
                        </Card>
                    ) : upcomingAppointments.length === 0 ? (
                        <Card>
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold mb-2">No Upcoming Appointments</h3>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                                    Book an appointment with a doctor to get started
                                </p>
                                <Link to="/doctors">
                                    <Button>Find a Doctor</Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.slice(0, 3).map((appointment) => (
                                <Card key={appointment._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                                            👨‍⚕️
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{appointment.doctor?.name || 'Dr. Name'}</h3>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                {appointment.doctor?.specialization || 'Specialization'}
                                            </p>
                                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="badge badge-success">Confirmed</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PatientDashboard;
