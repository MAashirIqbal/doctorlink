import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Calendar, Settings, LogOut, Shield, Save,
    UserCheck, BarChart3, CreditCard, LayoutDashboard, Bell,
    Lock, Globe, Mail, Eye, EyeOff, Palette, Database,
    Server, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSettings, updateSettings } from '../../api/adminAPI';

const sidebarLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCheck, label: 'Doctor Approvals', path: '/admin/approvals' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Mail, label: 'Contact Messages', path: '/admin/contact-messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings', active: true },
];

const ToggleSwitch = ({ enabled, onToggle }) => (
    <button onClick={onToggle} className="relative">
        {enabled ? (
            <ToggleRight size={36} className="text-primary-700" />
        ) : (
            <ToggleLeft size={36} className="text-gray-300" />
        )}
    </button>
);

const AdminSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [showPassword, setShowPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState({
        siteName: 'DoctorLink',
        siteEmail: 'admin@doctorlink.pk',
        supportEmail: 'support@doctorlink.pk',
        maintenanceMode: false,
        newRegistrations: true,
        doctorApplications: true,
        emailNotifications: true,
        appointmentAlerts: true,
        paymentAlerts: true,
        newDoctorAlerts: true,
        autoApprove: false,
        maxAppointmentsPerDay: 20,
        cancellationWindow: 24,
        patientPlatformFeePercent: 0,
        doctorPlatformFeePercent: 10,
        minDoctorFee: 500,
        maxDoctorFee: 10000,
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await getSettings();
                if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const updateSetting = (key, value) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleSave = async () => {
        try {
            await updateSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
    };

    const handleLogout = () => { logout(); navigate('/admin-portal/login'); };

    const tabs = [
        { key: 'general', label: 'General', icon: Globe },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'platform', label: 'Platform Rules', icon: Database },
        { key: 'security', label: 'Security', icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
                <div className="p-6 border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-primary-700 p-2 rounded-xl shadow-sm">
                            <Activity className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight font-display text-gray-900">
                            Doctor<span className="text-primary-700">Link</span>
                        </span>
                    </Link>
                    <div className="mt-4 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100 inline-flex items-center gap-1.5">
                        <Shield size={12} className="text-red-600" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Admin Panel</span>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link, i) => (
                        <Link key={i} to={link.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${link.active
                                ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                            <Shield size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" /></button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-40">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 font-display tracking-tight">Settings</h1>
                            <p className="text-sm font-bold text-gray-400 mt-0.5">Manage platform configuration and preferences</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${saved
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'bg-primary-700 text-white shadow-lg shadow-primary-700/20 hover:bg-primary-800'
                                }`}
                        >
                            <Save size={16} />
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {/* Tabs */}
                    <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-200/60 shadow-sm shadow-gray-200/50 mb-10 w-fit">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.key
                                    ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            {/* Site Info */}
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-6">Site Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Platform Name</label>
                                        <input
                                            type="text"
                                            value={settings.siteName}
                                            onChange={(e) => updateSetting('siteName', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Admin Email</label>
                                        <input
                                            type="email"
                                            value={settings.siteEmail}
                                            onChange={(e) => updateSetting('siteEmail', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Support Email</label>
                                        <input
                                            type="email"
                                            value={settings.supportEmail}
                                            onChange={(e) => updateSetting('supportEmail', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-6">Site Controls</h3>
                                <div className="space-y-5">
                                    {[
                                        { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable the platform for all users', danger: true },
                                        { key: 'newRegistrations', label: 'New Registrations', desc: 'Allow new patients to create accounts' },
                                        { key: 'doctorApplications', label: 'Doctor Applications', desc: 'Accept new doctor applications through the portal' },
                                    ].map(item => (
                                        <div key={item.key} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${item.danger && settings[item.key]
                                            ? 'bg-red-50 border-red-100'
                                            : 'bg-gray-50 border-gray-100'
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                {item.danger && settings[item.key] && <AlertTriangle size={18} className="text-red-500" />}
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{item.label}</p>
                                                    <p className="text-xs font-bold text-gray-400 mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                enabled={settings[item.key]}
                                                onToggle={() => updateSetting(item.key, !settings[item.key])}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-6">Notification Preferences</h3>
                                <div className="space-y-5">
                                    {[
                                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email alerts for important platform events', icon: Mail },
                                        { key: 'appointmentAlerts', label: 'Appointment Alerts', desc: 'Get notified about new and cancelled appointments', icon: Calendar },
                                        { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Receive alerts for payments and refund requests', icon: CreditCard },
                                        { key: 'newDoctorAlerts', label: 'New Doctor Applications', desc: 'Get notified when a new doctor submits an application', icon: UserCheck },
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
                                                    <item.icon size={18} className="text-primary-700" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{item.label}</p>
                                                    <p className="text-xs font-bold text-gray-400 mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                            <ToggleSwitch
                                                enabled={settings[item.key]}
                                                onToggle={() => updateSetting(item.key, !settings[item.key])}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Platform Rules Tab */}
                    {activeTab === 'platform' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-6">Appointment Rules</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Max Appointments Per Doctor / Day</label>
                                        <input
                                            type="number"
                                            value={settings.maxAppointmentsPerDay}
                                            onChange={(e) => updateSetting('maxAppointmentsPerDay', parseInt(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cancellation Window (Hours)</label>
                                        <input
                                            type="number"
                                            value={settings.cancellationWindow}
                                            onChange={(e) => updateSetting('cancellationWindow', parseInt(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div>
                                        <p className="text-sm font-black text-gray-900">Auto-Approve Doctors</p>
                                        <p className="text-xs font-bold text-gray-400 mt-0.5">Skip manual review and auto-approve doctor applications</p>
                                    </div>
                                    <ToggleSwitch
                                        enabled={settings.autoApprove}
                                        onToggle={() => updateSetting('autoApprove', !settings.autoApprove)}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-2">Fee Configuration</h3>
                                <p className="text-sm font-bold text-gray-400 mb-6">Control platform fees charged to patients and doctors separately</p>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Patient Platform Fee (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.patientPlatformFeePercent}
                                            onChange={(e) => updateSetting('patientPlatformFeePercent', parseInt(e.target.value) || 0)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                        <p className="text-[10px] font-bold text-gray-400 mt-1.5">Added on top of consultation fee. Set 0 for free.</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Doctor Platform Fee (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.doctorPlatformFeePercent}
                                            onChange={(e) => updateSetting('doctorPlatformFeePercent', parseInt(e.target.value) || 0)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                        <p className="text-[10px] font-bold text-gray-400 mt-1.5">Deducted from doctor's earnings per appointment.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Min Doctor Fee (PKR)</label>
                                        <input
                                            type="number"
                                            value={settings.minDoctorFee}
                                            onChange={(e) => updateSetting('minDoctorFee', parseInt(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Max Doctor Fee (PKR)</label>
                                        <input
                                            type="number"
                                            value={settings.maxDoctorFee}
                                            onChange={(e) => updateSetting('maxDoctorFee', parseInt(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-6">Change Admin Password</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter current password"
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 pr-12 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                            />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Confirm New Password</label>
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 font-bold text-sm focus:outline-none focus:border-primary-200 transition-all"
                                        />
                                    </div>
                                    <button className="px-8 py-3.5 bg-primary-700 text-white rounded-2xl font-black text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-700/20 active:scale-95 mt-2">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm shadow-gray-200/50 p-8">
                                <h3 className="text-lg font-black text-gray-900 font-display mb-4">System Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Server, label: 'Server Status', value: 'Online', color: 'text-emerald-600' },
                                        { icon: Database, label: 'Database', value: 'MongoDB Atlas', color: 'text-primary-700' },
                                        { icon: Globe, label: 'API Version', value: 'v1.0.0', color: 'text-gray-700' },
                                        { icon: Lock, label: 'SSL Certificate', value: 'Active', color: 'text-emerald-600' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                                <item.icon size={18} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                                <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-8">
                                <h3 className="text-lg font-black text-red-600 font-display mb-2">Danger Zone</h3>
                                <p className="text-sm font-bold text-gray-500 mb-6">Irreversible actions that affect the entire platform.</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-5 bg-red-50/50 rounded-2xl border border-red-100">
                                        <div>
                                            <p className="text-sm font-black text-gray-900">Reset All Settings</p>
                                            <p className="text-xs font-bold text-gray-400 mt-0.5">Restore all settings to their default values</p>
                                        </div>
                                        <button className="px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-black hover:bg-red-50 transition-all active:scale-95">
                                            Reset Settings
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-red-50/50 rounded-2xl border border-red-100">
                                        <div>
                                            <p className="text-sm font-black text-gray-900">Clear All Logs</p>
                                            <p className="text-xs font-bold text-gray-400 mt-0.5">Permanently delete all system and activity logs</p>
                                        </div>
                                        <button className="px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-black hover:bg-red-50 transition-all active:scale-95">
                                            Clear Logs
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
