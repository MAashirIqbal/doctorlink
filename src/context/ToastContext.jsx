import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const typeConfig = {
    success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', iconColor: 'text-emerald-600', bar: 'bg-emerald-500' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-600', bar: 'bg-red-500' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-600', bar: 'bg-amber-500' },
    info: { icon: Info, bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-800', iconColor: 'text-primary-600', bar: 'bg-primary-500' },
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container — bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => {
                        const config = typeConfig[t.type] || typeConfig.info;
                        const Icon = config.icon;
                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className={`pointer-events-auto flex items-start gap-3 min-w-[340px] max-w-[420px] px-5 py-4 rounded-2xl border shadow-2xl shadow-gray-900/10 ${config.bg} ${config.border} relative overflow-hidden`}
                            >
                                <div className={`absolute bottom-0 left-0 h-1 ${config.bar} animate-toast-bar`} />
                                <Icon size={20} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
                                <p className={`text-sm font-bold ${config.text} flex-1 leading-relaxed`}>{t.message}</p>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
