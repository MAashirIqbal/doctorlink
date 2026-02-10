import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Calendar, CreditCard, Info, X } from 'lucide-react';
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationAPI';

const typeIcons = {
    appointment: Calendar,
    payment: CreditCard,
    info: Info,
};

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await getMyNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setOpen((prev) => !prev);
        if (!open) fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        setLoading(true);
        try {
            await markAllNotificationsRead();
            await fetchNotifications();
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleMarkOneRead = async (id) => {
        try {
            await markNotificationRead(id);
            await fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleToggle}
                className="relative p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition-all"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-black flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl border border-gray-200/60 shadow-2xl shadow-gray-200/50 z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-black text-gray-900">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all disabled:opacity-50"
                                    >
                                        <CheckCheck size={12} />
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell size={32} className="text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-black text-gray-400">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 15).map((n) => {
                                    const Icon = typeIcons[n.type] || Info;
                                    return (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                                            className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50 transition-all cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-primary-50/30' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'}`}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-black truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                                <p className="text-[11px] font-bold text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                                            </div>
                                            {!n.isRead && (
                                                <div className="w-2 h-2 bg-primary-700 rounded-full flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {notifications.length > 15 && (
                            <div className="px-5 py-3 border-t border-gray-100 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Showing 15 of {notifications.length}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
