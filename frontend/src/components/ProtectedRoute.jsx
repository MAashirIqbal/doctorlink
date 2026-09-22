import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect to their own dashboard
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
        return <Navigate to="/patient/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
