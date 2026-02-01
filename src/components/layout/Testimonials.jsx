import React from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
    const reviews = [
        {
            name: "Sarah Jenkins",
            role: "Patient",
            text: "DoctorLink made it so easy to find a specialist for my mother. The interface is intuitive and the booking was instant. Truly a lifesaver!",
            rating: 5,
            image: "https://i.pravatar.cc/150?img=32"
        },
        {
            name: "Dr. Michael Chen",
            role: "Cardiologist",
            text: "As a provider, I've seen a 30% increase in my practice efficiency. The automated scheduling and patient history tools are world-class.",
            rating: 5,
            image: "https://i.pravatar.cc/150?img=12"
        },
        {
            name: "Emily Rodriguez",
            role: "Patient",
            text: "Finally, a medical app that doesn't feel like it was built in the 90s. Clean, fast, and the doctors on here are top-tier.",
            rating: 5,
            image: "https://i.pravatar.cc/150?img=44"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 font-bold text-sm mb-4 uppercase tracking-widest border border-primary-200">
                        Testimonials
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                        Trusted by thousands of <span className="text-primary-700">happy patients.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <div key={i} className="bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100/50 relative group hover:bg-emerald-100/30 transition-all duration-500">
                            <div className="absolute top-8 right-10 text-emerald-200">
                                <Quote size={48} fill="currentColor" />
                            </div>

                            <div className="flex text-accent-500 mb-6">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                            </div>

                            <p className="text-gray-700 text-lg font-bold leading-relaxed mb-8 italic opacity-90">
                                "{review.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <img src={review.image} alt={review.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shadow-emerald-900/10" />
                                <div>
                                    <h4 className="text-lg font-black text-gray-900">{review.name}</h4>
                                    <p className="text-sm font-bold text-primary-700">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
