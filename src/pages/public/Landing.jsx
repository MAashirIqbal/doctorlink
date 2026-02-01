import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const Landing = () => {
    const features = [
        {
            icon: '🔍',
            title: 'Find Doctors',
            description: 'Search and filter through hundreds of qualified doctors by specialization, experience, and ratings.',
        },
        {
            icon: '📅',
            title: 'Book Instantly',
            description: 'Schedule appointments in just a few clicks. View real-time availability and confirm instantly.',
        },
        {
            icon: '💳',
            title: 'Secure Payments',
            description: 'Pay securely through integrated payment gateway. Get instant confirmation and receipts.',
        },
        {
            icon: '⭐',
            title: 'Reviews & Ratings',
            description: 'Read genuine reviews from other patients. Make informed decisions about your healthcare.',
        },
    ];

    const stats = [
        { value: '500+', label: 'Verified Doctors' },
        { value: '10k+', label: 'Happy Patients' },
        { value: '50+', label: 'Specializations' },
        { value: '24/7', label: 'Support' },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-transparent dark:from-primary/10 dark:via-accent/10 py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Your Health,{' '}
                                <span className="text-gradient">Our Priority</span>
                            </h1>
                            <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-8">
                                Connect with qualified doctors, book appointments instantly, and manage your healthcare journey all in one place.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/register">
                                    <Button size="lg">Get Started Free</Button>
                                </Link>
                                <Link to="/doctors">
                                    <Button variant="outline" size="lg">Browse Doctors</Button>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Placeholder for 3D Model */}
                            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-8xl mb-4 animate-float">👨‍⚕️</div>
                                    <p className="text-text-muted-light dark:text-text-muted-dark">3D Model Placeholder</p>
                                </div>
                            </div>
                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-xl"
                            />
                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white dark:bg-surface-dark border-y border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                                <div className="text-text-secondary-light dark:text-text-secondary-dark">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-background-light dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Why Choose Doctor Link?</h2>
                        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
                            Experience healthcare the modern way with our comprehensive platform designed for your convenience.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full text-center">
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                        {feature.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-accent">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Take Control of Your Health?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join thousands of patients who trust Doctor Link for their healthcare needs.
                        </p>
                        <Link to="/register">
                            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                                Start Your Journey Today
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
