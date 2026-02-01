import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQ = () => {
    const [openIdx, setOpenIdx] = useState(0);

    const faqs = [
        {
            q: "Is DoctorLink free for patients?",
            a: "Yes! Creating an account and searching for doctors is completely free for patients. You only pay for your actual consultations with the medical providers."
        },
        {
            q: "How do I book an emergency appointment?",
            a: "While DoctorLink is great for quick bookings, if you have a life-threatening emergency, please call 911 or visit your nearest emergency room immediately."
        },
        {
            q: "Are my medical records secure?",
            a: "Absolutely. We use bank-grade AES-256 encryption and are fully HIPAA compliant to ensure your personal health information stays private and secure."
        },
        {
            q: "Can I cancel my appointment?",
            a: "Yes, you can cancel or reschedule up to 24 hours before your appointment directly through the 'My Appointments' dashboard."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 text-accent-700 font-bold text-sm mb-4 uppercase tracking-widest border border-accent-100">
                        <HelpCircle size={16} />
                        Common Questions
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                        Got questions? <br />
                        <span className="text-primary-700">We've got answers.</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`rounded-3xl border transition-all duration-300 ${openIdx === i
                                    ? 'bg-primary-50/50 border-primary-200 shadow-sm'
                                    : 'bg-[#fafafa] border-gray-100 hover:border-primary-100'
                                }`}
                        >
                            <button
                                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left group"
                            >
                                <span className={`text-xl font-black transition-colors ${openIdx === i ? 'text-primary-800' : 'text-gray-900'}`}>
                                    {faq.q}
                                </span>
                                <div className={`p-2 rounded-xl transition-all ${openIdx === i ? 'bg-primary-700 text-white rotate-0' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                    {openIdx === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                            </button>

                            {openIdx === i && (
                                <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-gray-700 text-lg font-bold leading-relaxed opacity-75">
                                        {faq.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
