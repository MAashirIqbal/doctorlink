import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { getActiveAnnouncements, dismissAnnouncement } from '../api/adminAPI';

const typeStyles = {
    info: { bg: 'bg-blue-600', border: 'border-blue-700', icon: Info, text: 'text-white' },
    warning: { bg: 'bg-amber-500', border: 'border-amber-600', icon: AlertTriangle, text: 'text-white' },
    critical: { bg: 'bg-red-600', border: 'border-red-700', icon: AlertCircle, text: 'text-white' },
    success: { bg: 'bg-emerald-600', border: 'border-emerald-700', icon: CheckCircle2, text: 'text-white' },
};

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getActiveAnnouncements();
                setAnnouncements(data.announcements || []);
            } catch (err) { /* silently fail */ }
        };
        fetch();
    }, []);

    const handleDismiss = async (id) => {
        try {
            await dismissAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a._id !== id));
        } catch (err) { /* silently fail */ }
    };

    if (announcements.length === 0) return null;

    return (
        <div className="space-y-0">
            {announcements.map((a) => {
                const style = typeStyles[a.type] || typeStyles.info;
                const Icon = style.icon;
                return (
                    <div key={a._id} className={`${style.bg} ${style.text} border-b ${style.border}`}>
                        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <Icon size={16} className="flex-shrink-0 opacity-90" />
                                <div className="min-w-0">
                                    <span className="text-xs font-black uppercase tracking-wider opacity-80 mr-2">{a.title}</span>
                                    <span className="text-sm font-bold opacity-95">{a.message}</span>
                                </div>
                            </div>
                            {a.isDismissible && (
                                <button onClick={() => handleDismiss(a._id)}
                                    className="p-1 rounded-lg hover:bg-white/20 transition-all flex-shrink-0 opacity-70 hover:opacity-100">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AnnouncementBanner;
