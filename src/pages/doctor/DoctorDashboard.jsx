import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const DoctorDashboard = () => {
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
            // Mock data for development
            setAppointments([
                {
                    _id: '1',
                    patient: { name: 'John Doe', phone: '+1234567890' },
                    date: new Date(Date.now() + 86400000).toISOString(),
                    time: '10:00 AM',
                    status: 'pending',
                },
                {
                    _id: '2',
                    patient: { name: 'Jane Smith', phone: '+1234567891' },
                    date: new Date(Date.now() + 172800000).toISOString(),
                    time: '2:00 PM',
                    status: 'confirmed',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await appointmentService.updateAppointmentStatus(id, status);
            toast.success(`Appointment ${status}`);
            fetchAppointments();
        } catch (error) {
            toast.error('Failed to update appointment');
        }
    };

    const todayAppointments = appointments.filter(
        (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
    );

    const pendingAppointments = appointments.filter((apt) => apt.status === 'pending');

    const stats = [
        { label: "Today's Appointments", value: todayAppointments.length, color: 'text-primary' },
        { label: 'Pending Requests', value: pendingAppointments.length, color: 'text-status-warning' },
        { label: 'Total Patients', value: appointments.length, color: 'text-status-success' },
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
                        Welcome, <span className="text-gradient">Dr. {user?.name}</span>!
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        Here's your practice overview for today
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
                                        {stat.label}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Pending Requests */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold mb-4">Pending Appointment Requests</h2>
                    {loading ? (
                        <Card>
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
                            </div>
                        </Card>
                    ) : pendingAppointments.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">✅</div>
                                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                    No pending appointment requests
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {pendingAppointments.map((appointment) => (
                                <Card key={appointment._id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white text-xl">
                                                🧑‍💼
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{appointment.patient?.name}</h3>
                                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                    {appointment.patient?.phone}
                                                </p>
                                                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                                            >
                                                ✓ Accept
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                                            >
                                                ✗ Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Today's Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-2xl font-bold mb-4">Today's Schedule</h2>
                    {todayAppointments.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold mb-2">No Appointments Today</h3>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                    Enjoy your day off!
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {todayAppointments.map((appointment) => (
                                <Card key={appointment._id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                                                🧑‍💼
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{appointment.patient?.name}</h3>
                                                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                                                    {appointment.time}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`badge ${appointment.status === 'confirmed' ? 'badge-success' :
                                            appointment.status === 'pending' ? 'badge-warning' :
                                                'badge-error'
                                            }`}>
                                            {appointment.status}
                                        </span>
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

export default DoctorDashboard;
