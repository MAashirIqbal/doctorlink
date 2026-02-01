import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authService } from '@/services';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['patient', 'doctor']),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('patient');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'patient' },
    });

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setValue('role', role);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await authService.register(data);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark">
            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden md:block"
                >
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-9xl mb-4 animate-float">
                                {selectedRole === 'doctor' ? '👨‍⚕️' : '🧑‍💼'}
                            </div>
                            <h3 className="text-2xl font-bold text-gradient">
                                {selectedRole === 'doctor' ? 'Join as Doctor' : 'Join as Patient'}
                            </h3>
                            <p className="text-text-muted-light dark:text-text-muted-dark mt-2">
                                {selectedRole === 'doctor'
                                    ? 'Help patients find the care they need'
                                    : 'Find the best doctors for your health'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Join Doctor Link today
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => handleRoleChange('patient')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${selectedRole === 'patient'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🧑‍💼</div>
                                <div className="font-semibold">Patient</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleChange('doctor')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${selectedRole === 'doctor'
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-300 dark:border-gray-600'
                                    }`}
                            >
                                <div className="text-2xl mb-1">👨‍⚕️</div>
                                <div className="font-semibold">Doctor</div>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                error={errors.name?.message}
                                {...register('name')}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+1234567890"
                                error={errors.phone?.message}
                                {...register('phone')}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register('password')}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword')}
                            />

                            <Button type="submit" className="w-full" loading={loading}>
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary hover:text-primary-hover font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
