import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Send, Search, ArrowLeft, MessageCircle, User,
    Calendar, Wallet, ClipboardList, Stethoscope, LogOut, Sparkles, Heart
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listConversations, getThread, sendMessage, markThreadRead } from '../../api/messageAPI';
import { FILE_BASE, resolveFileUrl } from '../../api/axios';

const POLL_MS = 8000;

const Messages = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const role = user?.role;

    const [conversations, setConversations] = useState([]);
    const [activeId, setActiveId] = useState(params.get('with') || ''); // doctorProfileId for patient, patientUserId for doctor
    const [activeMeta, setActiveMeta] = useState(null);
    const [thread, setThread] = useState([]);
    const [draft, setDraft] = useState('');
    const [search, setSearch] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchConvos = async () => {
        try {
            const { data } = await listConversations();
            setConversations(data.conversations || []);
        } catch { /* ignore */ }
    };

    const fetchThread = async (withId) => {
        if (!withId) return;
        try {
            const { data } = await getThread(withId);
            setThread(data.messages || []);
            await markThreadRead(withId).catch(() => {});
            // Refresh sidebar unread counts
            fetchConvos();
        } catch { /* ignore */ }
    };

    // Initial + polling
    useEffect(() => {
        fetchConvos();
        const id = setInterval(() => {
            fetchConvos();
            if (activeId) fetchThread(activeId);
        }, POLL_MS);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    // Load thread when active changes
    useEffect(() => {
        if (activeId) fetchThread(activeId);
        else setThread([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [thread]);

    const openConversation = (c) => {
        // Patient threads use doctorProfileId; doctor threads use otherUserId.
        const id = role === 'patient' ? c.doctorProfileId : c.otherUserId;
        if (!id) return;
        setActiveId(id);
        setActiveMeta(c);
        setParams({ with: id });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!draft.trim() || !activeId) return;
        setSending(true);
        try {
            await sendMessage({ with: activeId, body: draft.trim() });
            setDraft('');
            await fetchThread(activeId);
        } catch { /* ignore */ }
        setSending(false);
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const filtered = conversations.filter((c) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return c.displayName?.toLowerCase().includes(q) || c.lastMessage?.toLowerCase().includes(q);
    });

    const sidebarLinks = role === 'patient' ? [
        { icon: Activity, label: 'Dashboard', path: '/patient/dashboard' },
        { icon: Calendar, label: 'My Appointments', path: '/patient/appointments' },
        { icon: Sparkles, label: 'Symptom Analyzer', path: '/patient/symptom-analyzer' },
        { icon: MessageCircle, label: 'Messages', path: '/messages', active: true },
        { icon: Search, label: 'Find Doctors', path: '/doctors' },
        { icon: User, label: 'My Profile', path: '/patient/profile' },
    ] : [
        { icon: Activity, label: 'Dashboard', path: '/doctor/dashboard' },
        { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
        { icon: Heart, label: 'My Patients', path: '/doctor/patients' },
        { icon: MessageCircle, label: 'Messages', path: '/messages', active: true },
        { icon: Wallet, label: 'Earnings', path: '/doctor/earnings' },
        { icon: ClipboardList, label: 'Schedule', path: '/doctor/schedule' },
        { icon: User, label: 'Profile', path: '/doctor/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
                <div className="p-6 border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-primary-700 p-2 rounded-xl shadow-sm"><Activity className="text-white w-5 h-5" /></div>
                        <span className="text-xl font-black tracking-tight font-display text-gray-900">Doctor<span className="text-primary-700">Link</span></span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((l, i) => (
                        <Link key={i} to={l.path} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${l.active ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <l.icon size={18} />{l.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white font-black text-sm">{user?.name?.[0]}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button onClick={handleLogout}><LogOut size={16} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-h-screen flex">
                {/* Conversation list */}
                <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
                    <div className="p-5 border-b border-gray-100 sticky top-0 bg-white">
                        <h1 className="text-xl font-black text-gray-900 font-display">Messages</h1>
                        <div className="relative mt-3">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search conversations"
                                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:border-primary-200" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-center text-xs font-bold text-gray-400 py-12">No conversations yet</p>
                        ) : filtered.map((c) => {
                            const id = role === 'patient' ? c.doctorProfileId : c.otherUserId;
                            const isActive = id === activeId;
                            return (
                                <button key={c.otherUserId} onClick={() => openConversation(c)}
                                    className={`w-full text-left flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-all ${isActive ? 'bg-primary-50' : ''}`}>
                                    {c.avatar ? (
                                        <img src={resolveFileUrl(c.avatar)} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-black flex-shrink-0">{c.displayName?.[0]}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-black text-gray-900 truncate">{c.displayName}</p>
                                            {c.unread > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] bg-primary-700 text-white text-[10px] font-black rounded-full px-1.5">{c.unread}</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-500 truncate">{c.lastMessage}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Thread view */}
                <div className="flex-1 flex flex-col">
                    {!activeId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle size={48} className="text-gray-200 mb-3" />
                            <p className="text-sm font-bold">Pick a conversation to start chatting</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3">
                                <button onClick={() => { setActiveId(''); setParams({}); }} className="lg:hidden p-2 rounded-xl hover:bg-gray-50">
                                    <ArrowLeft size={16} />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black">{activeMeta?.displayName?.[0] || '?'}</div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{activeMeta?.displayName || 'Conversation'}</p>
                                    <p className="text-[10px] font-bold text-gray-400">{activeMeta?.displaySubtitle}</p>
                                </div>
                            </div>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
                                {thread.length === 0 && <p className="text-center text-xs font-bold text-gray-400 py-12">Send the first message below</p>}
                                {thread.map((m) => {
                                    const mine = String(m.sender) === String(user?._id);
                                    return (
                                        <motion.div key={m._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-bold leading-relaxed ${mine ? 'bg-primary-700 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'}`}>
                                                <p className="whitespace-pre-wrap">{m.body}</p>
                                                <p className={`text-[9px] font-bold mt-1 ${mine ? 'text-primary-200' : 'text-gray-400'}`}>
                                                    {new Date(m.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <form onSubmit={handleSend} className="bg-white border-t border-gray-100 p-4 flex items-center gap-3">
                                <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary-200" />
                                <button type="submit" disabled={!draft.trim() || sending}
                                    className="px-5 py-3 bg-primary-700 hover:bg-primary-600 text-white rounded-xl text-xs font-black flex items-center gap-2 disabled:opacity-50">
                                    <Send size={14} />
                                    Send
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Messages;
