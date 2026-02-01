import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await authService.login(data);
            login(response.user, response.token);
            toast.success('Login successful!');

            // Redirect based on role
            if (response.user.role === 'doctor') {
                navigate('/doctor/dashboard');
            } else if (response.user.role === 'patient') {
                navigate('/patient/dashboard');
            } else if (response.user.role === 'admin') {
                navigate('/admin/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
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
                            <div className="text-9xl mb-4 animate-float">🔐</div>
                            <h3 className="text-2xl font-bold text-gradient">Secure Access</h3>
                            <p className="text-text-muted-light dark:text-text-muted-dark mt-2">
                                Your health data is safe with us
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
                            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Sign in to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register('password')}
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        Remember me
                                    </span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:text-primary-hover"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" loading={loading}>
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary hover:text-primary-hover font-semibold">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
