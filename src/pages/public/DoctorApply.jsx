import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Stethoscope, Briefcase,
    CreditCard, Upload, ArrowRight, Sparkles,
    ShieldCheck, ChevronDown, CheckCircle2,
    FileText, Fingerprint, MapPin, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomDropdown = ({ options, selected, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/5 border ${isOpen ? 'border-emerald-500/50' : 'border-white/5'} rounded-2xl py-4 px-4 text-white font-bold text-sm cursor-pointer transition-all flex justify-between items-center shadow-inner group`}
            >
                <span className={selected ? 'text-white' : 'text-white/30'}>
                    {selected || placeholder}
                </span>
                <ChevronDown size={18} className={`text-emerald-500/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-[100] w-full bg-[#0d211b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Search in Dropdown */}
                        <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                            <Search size={14} className="text-emerald-500/50" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search specialization..."
                                className="bg-transparent border-none outline-none text-white text-xs w-full font-medium"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* List Area */}
                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => {
                                        onSelect(opt);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center justify-between ${selected === opt
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-white/60 hover:bg-white/5 hover:text-emerald-400'
                                        }`}
                                >
                                    {opt}
                                    {selected === opt && <CheckCircle2 size={14} />}
                                </div>
                            )) : (
                                <div className="p-4 text-center text-white/30 text-xs font-bold uppercase tracking-widest italic">
                                    No specialization found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DocumentUpload = ({ label, description }) => {
    const [file, setFile] = useState(null);
    return (
        <div className="relative group p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files[0])} />
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20 group-hover:text-emerald-500/50'}`}>
                    {file ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-black text-white leading-tight">{label}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">
                        {file ? file.name : description}
                    </p>
                </div>
            </div>
        </div>
    );
};

const DoctorApply = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [step, setStep] = useState(1);
    const [specialization, setSpecialization] = useState("");

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStep(1);
    };

    const specializations = [
        "Cardiologist", "Dermatologist", "Pediatrician",
        "Neurologist", "Orthopedic Surgeon", "General Physician",
        "Psychiatrist", "Gastroenterologist", "Urologist",
        "Nephrologist", "Pulmonologist", "Oncologist",
        "E.N.T Specialist", "Ophthalmologist (Eye)", "Gynecologist",
        "Anesthesiologist", "Radiologist", "Pathologist",
        "Physiotherapist", "Dietitian & Nutritionist",
        "General Surgeon", "Endocrinologist", "Rheumatologist",
        "Dentist", "Plastic Surgeon"
    ];

    return (
        <div className="min-h-screen bg-[#061410] flex items-center justify-center p-4 relative overflow-hidden font-display selection:bg-emerald-500/30">
            {/* Ambient Background - Medical Pulse Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1], x: [-100, 100, -100] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent blur-sm"
                />
            </div>

            {/* Main 3D Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-5xl h-[700px] z-10 perspective-2000"
            >
                {/* The Master Card */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex overflow-hidden">

                    {/* Left Side: Provider Login Form */}
                    <div className="w-1/2 p-12 lg:p-16 flex flex-col justify-center relative">
                        <motion.div
                            animate={{
                                opacity: isLogin ? 1 : 0,
                                x: isLogin ? 0 : -20,
                                scale: isLogin ? 1 : 0.95,
                                pointerEvents: isLogin ? 'auto' : 'none'
                            }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full"
                        >
                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic underline decoration-emerald-500/50 underline-offset-8">Sign In</h2>
                            <p className="text-emerald-500 font-black mb-12 italic uppercase tracking-[0.2em] text-[10px]">Portal Access for PMC Members</p>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">Verified Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                            <input type="email" placeholder="dr.ali@health.gov.pk"
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">PMC Security Pin</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" size={20} />
                                            <input type="password" placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-[0.98]">
                                    Verify & Enter
                                    <ShieldCheck size={20} />
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Right Side: Provider Application Form */}
                    <div className="w-1/2 p-12 lg:p-14 flex flex-col justify-center relative">
                        <motion.div
                            animate={{
                                opacity: !isLogin ? 1 : 0,
                                x: !isLogin ? 0 : 20,
                                scale: !isLogin ? 1 : 0.95,
                                pointerEvents: !isLogin ? 'auto' : 'none'
                            }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full"
                        >
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                        <div>
                                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic underline decoration-emerald-500/50 underline-offset-8">Verify PMC</h2>
                                            <p className="text-emerald-500 font-black italic uppercase tracking-[0.2em] text-[10px]">Medical Professional Credentialing</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                                                <input type="text" placeholder="Full Name (As per NIC)" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner uppercase tracking-wider" />
                                            </div>
                                            <div className="relative">
                                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                                                <input type="text" placeholder="CNIC Number (13 Digits)" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
                                            </div>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                                                <input type="text" placeholder="PMC/PMDC Registration #" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                                                <input type="email" placeholder="Official Work Email" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-black text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
                                            </div>
                                        </div>
                                        <button onClick={() => setStep(2)} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 group active:scale-[0.98] shadow-xl shadow-emerald-950/40 text-lg">
                                            Next Component
                                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                ) : step === 2 ? (
                                    <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                        <div>
                                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic underline decoration-emerald-500/50 underline-offset-8">Clinical Scope</h2>
                                            <p className="text-emerald-500 font-black italic uppercase tracking-[0.2em] text-[10px]">Specialization & Expertise</p>
                                        </div>

                                        <div className="space-y-4">
                                            <CustomDropdown
                                                options={specializations}
                                                selected={specialization}
                                                onSelect={setSpecialization}
                                                placeholder="Select Clinical Specialty"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={16} />
                                                    <input type="number" placeholder="Experience" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-bold text-sm shadow-inner" />
                                                </div>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={16} />
                                                    <input type="number" placeholder="Fee (PKR)" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-bold text-sm shadow-inner" />
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40" size={16} />
                                                <input type="text" placeholder="Clinic/Hospital Location" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-bold text-sm shadow-inner" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => setStep(1)} className="flex-1 bg-white/5 py-4 rounded-2xl text-white/50 font-black hover:bg-white/10 transition-all italic tracking-[0.2em] uppercase text-xs">Back</button>
                                            <button onClick={() => setStep(3)} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all active:scale-[0.98] shadow-xl shadow-emerald-950/40">
                                                Documentation
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                        <div>
                                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic underline decoration-emerald-500/50 underline-offset-8">Final Proofs</h2>
                                            <p className="text-emerald-500 font-black italic uppercase tracking-[0.2em] text-[10px]">Regulatory Compliance Documents</p>
                                        </div>

                                        <div className="space-y-3">
                                            <DocumentUpload label="PMC License (Front)" description="Valid PMC/PMDC Card Image" />
                                            <DocumentUpload label="Degree Certificate" description="MBBS or Specialty Degree" />
                                            <DocumentUpload label="CNIC Copy" description="Front & Back (National ID)" />
                                        </div>

                                        <div className="flex gap-4">
                                            <button onClick={() => setStep(2)} className="flex-1 bg-white/5 py-4 rounded-2xl text-white/50 font-black hover:bg-white/10 transition-all italic tracking-[0.2em] uppercase text-xs">Back</button>
                                            <button className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all active:scale-[0.98] shadow-xl shadow-emerald-950/40 text-lg">
                                                Submit Profile
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* The 3D Sliding Overlay */}
                    <motion.div
                        initial={false}
                        animate={{
                            x: isLogin ? '99%' : '-1%',
                            rotateY: isLogin ? -10 : 10
                        }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            backfaceVisibility: 'hidden',
                            willChange: 'transform'
                        }}
                        className="absolute top-0 left-0 w-[51%] h-full bg-gradient-to-br from-emerald-600 to-emerald-950 z-30 flex flex-col items-center justify-center p-12 text-center shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(16,185,129,0.2)]"
                    >
                        {/* High-Fidelity Pulse Decoration */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="w-full h-full bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[size:40px_40px]"
                            />
                        </div>

                        <div className="relative z-10 flex flex-col items-center w-full">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="mb-10 w-28 h-28 bg-white/10 rounded-[2.5rem] border border-white/20 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md">
                                <Stethoscope size={56} className="text-white" strokeWidth={1} />
                            </motion.div>

                            <h3 className="text-5xl font-black text-white mb-8 leading-none tracking-tighter uppercase italic">
                                {isLogin ? (
                                    <>Medical <br />Partnership</>
                                ) : (
                                    <>Welcome <br />Back, Doc</>
                                )}
                            </h3>
                            <p className="text-emerald-100/70 font-black mb-12 max-w-xs mx-auto text-[10px] uppercase tracking-[0.3em] leading-loose italic">
                                {isLogin
                                    ? "Official portal for all healthcare specialists. Join the future of telemedicine in Pakistan."
                                    : "Access your clinic dashboard and manage patient consultations securely."}
                            </p>
                            <button onClick={toggleMode} className="px-14 py-5 bg-white text-[#063b2a] rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-emerald-400/30 uppercase tracking-widest">
                                {isLogin ? "Apply Now" : "Sign In"}
                            </button>
                        </div>

                        <div className="absolute bottom-12 flex items-center gap-2 opacity-50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-black text-[9px] text-white tracking-[0.5em] uppercase">Verified Provider Unit</span>
                        </div>
                    </motion.div>
                </div>

                {/* Return Home Link */}
                <Link to="/" className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30 hover:text-emerald-400 transition-all font-black text-sm group">
                    <motion.div whileHover={{ x: -5 }} className="flex items-center gap-2">
                        ← Back to Home
                    </motion.div>
                </Link>
            </motion.div>

            {/* Global Style for Perspective & Custom Scrollbar */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-2000 { perspective: 2000px; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(16, 185, 129, 0.2); 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
            `}} />
        </div>
    );
};

export default DoctorApply;