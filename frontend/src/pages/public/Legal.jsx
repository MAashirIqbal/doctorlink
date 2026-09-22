import React from 'react';
import { Link } from 'react-router-dom';

const Legal = () => {
    const sections = [
        { id: "preamble", title: "Preamble & Acceptance" },
        { id: "regulatory", title: "1. Regulatory Framework (PMC/PMDC)" },
        { id: "consent", title: "2. Mandatory Informed Consent" },
        { id: "scope", title: "3. Scope of Virtual Care" },
        { id: "eto", title: "4. Electronic Transactions (ETO 2002)" },
        { id: "peca", title: "5. Data Privacy (PECA 2016)" },
        { id: "liability", title: "6. Limitation of Liability" },
        { id: "dispute", title: "7. Dispute Resolution" },
        { id: "termination", title: "8. Termination of Service" }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-50">
            {/* Slim Technical Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-base font-black tracking-tighter text-gray-900 uppercase">
                            Doctor<span className="text-emerald-600">Link</span>
                        </Link>
                        <div className="h-4 w-px bg-gray-200" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legal Portal v1.0.4</span>
                    </div>
                    <Link to="/login" className="text-[10px] font-black text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                        ← Exit to Portal
                    </Link>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex">
                {/* Index Sidebar - 10-15% Width */}
                <aside className="hidden lg:block w-72 h-[calc(100vh-3.5rem)] sticky top-14 border-r border-gray-50 p-8 overflow-y-auto">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Table of Contents</p>
                    <nav className="space-y-1">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="block py-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-all border-l-2 border-transparent hover:border-emerald-200 pl-4"
                            >
                                {s.title}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                            This document is legally binding under the Electronic Transactions Ordinance 2002 of Pakistan.
                        </p>
                    </div>
                </aside>

                {/* Main Content Area - 85-90% Width */}
                <main className="flex-1 px-8 lg:px-16 py-12 lg:py-20 max-w-4xl">
                    <div className="mb-16">
                        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Legal Governance & Terms of Use</h1>
                        <p className="text-gray-500 font-medium text-sm">Last Revised: February 02, 2026</p>
                    </div>

                    <div className="space-y-16">
                        <section id="preamble" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">Preamble & Acceptance</h2>
                            <p className="text-gray-600 leading-relaxed font-medium mb-4">
                                These Terms and Conditions govern the use of the DoctorLink Telemedicine Portal. By accessing this platform, you certify that you are a citizen or legal resident of Pakistan, holding a valid CNIC or B-Form, and that you voluntarily enter into this digital healthcare agreement.
                            </p>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                If you do not agree to the entirety of these terms, you must immediately cease all use of the platform and uninstall any related applications.
                            </p>
                        </section>

                        <section id="regulatory" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">1. Regulatory Framework (PMC/PMDC)</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-800 mb-2">1.1 Statutory Compliance</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-none">
                                        DoctorLink is built to comply with the 'Telemedicine Practice Guidelines 2023' (The Guidelines). We serve as a 'Technology Intermediary' as defined by the Ministry of National Health Services, Regulations & Coordination.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-800 mb-2">1.2 Practitioner Verification</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                        Every registered practitioner utilizes their unique PMC/PMDC Registration Number for verification. DoctorLink performs secondary verification of these credentials against the national registry before granting 'Specialist' status on the portal.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section id="consent" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">2. Mandatory Informed Consent</h2>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4 italic bg-emerald-50 p-6 border-l-4 border-emerald-500 rounded-r-xl">
                                "I hereby understand that telemedicine involves the use of electronic communications to enable healthcare providers at different locations to share individual patient medical information for the purpose of improving patient care."
                            </p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Chapter 3 of the national guidelines mandates that consent is a prerequisite for any remote consultation. You acknowledge that certain diagnostic physical tests cannot be performed remotely, and you accept the risks associated with information loss due to technical failures.
                            </p>
                        </section>

                        <section id="scope" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">3. Scope of Virtual Care</h2>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                                Our platform supports 'First Consultations' and 'Follow-up Consultations'. However, as per PMDC Code of Ethics:
                            </p>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-3 font-medium">
                                <li>Psychotropic substances and narcotics (Schedule G) will not be prescribed.</li>
                                <li>Injectable medications are prohibited via virtual prescription.</li>
                                <li>Practitioners reserve the right to immediately refer the patient to a brick-and-mortar facility if symptoms indicate acute severity.</li>
                            </ul>
                        </section>

                        <section id="eto" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">4. Electronic Transactions (ETO 2002)</h2>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Under the Electronic Transactions Ordinance (ETO) 2002, digital prescriptions, electronic receipts, and automated booking confirmations generated by DoctorLink carry the same legal weight as their physical counterparts. Digital signatures of doctors within our EMR system are recognized as valid medical signatures.
                            </p>
                        </section>

                        <section id="peca" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">5. Data Privacy (PECA 2016)</h2>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                                In alignment with the Prevention of Electronic Crimes Act (PECA) 2016 and the impending Personal Data Protection Bill:
                            </p>
                            <div className="grid md:grid-cols-2 gap-8 mt-6">
                                <div className="p-6 border border-gray-100 rounded-2xl">
                                    <h4 className="text-xs font-black mb-3 uppercase tracking-widest text-emerald-700">Storage</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">Medical records are stored for 10 years in encrypted Tier III data centers within sovereign territory.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-2xl">
                                    <h4 className="text-xs font-black mb-3 uppercase tracking-widest text-emerald-700">Encryption</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">Video streams are E2EE via WebRTC protocols. No session data is recorded without dual-party intent.</p>
                                </div>
                            </div>
                        </section>

                        <section id="liability" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">6. Limitation of Liability</h2>
                            <p className="text-sm text-gray-900 font-black mb-4 uppercase scale-95 origin-left">Absolute Disclaimer of Liability:</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                DoctorLink is a platform provider and is not liable for medical negligence (malpractice), misdiagnosis, or incorrect treatment plans provided by independent practitioners. Any legal action regarding medical outcomes must be directed toward the individual practitioner or their registered clinic/hospital.
                            </p>
                        </section>

                        <section id="dispute" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">7. Dispute Resolution</h2>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                All disputes arising from the use of this portal shall first be attempted to be resolved via internal mediation. If unresolved, disputes will be subject to the jurisdiction of the competent courts in the Islamic Republic of Pakistan, specifically those within the provincial capital of the registered user.
                            </p>
                        </section>

                        <section id="termination" className="scroll-mt-24">
                            <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">8. Termination of Service</h2>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                DoctorLink reserves the right to terminate or suspend access to any user account immediately, without prior notice or liability, for conduct that violates these terms or is harmful to other users, practitioners, or the platform’s integrity.
                            </p>
                        </section>
                    </div>

                    <div className="mt-20 pt-16 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-1">Signed Digitally By:</p>
                            <p className="text-sm font-black text-gray-900">Compliance Officer, DoctorLink PK</p>
                        </div>
                        <Link to="/register" className="bg-gray-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl shadow-gray-200">
                            Acknowledge & Accept
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Legal;
