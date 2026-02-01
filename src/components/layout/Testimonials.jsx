import React from 'react';
import { Star, Quote } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

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
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display leading-[1.1]">
                        Trusted by thousands of <br />
                        <span className="text-primary-700">happy patients.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <Tilt
                            key={i}
                            tiltMaxAngleX={10}
                            tiltMaxAngleY={10}
                            perspective={1000}
                            scale={1.02}
                            transitionSpeed={2000}
                            gyroscope={true}
                        >
                            <div className="h-full bg-emerald-50/40 p-10 rounded-[2.5rem] border border-emerald-100/50 relative group hover:bg-emerald-100/40 transition-all duration-500 shadow-lg hover:shadow-2xl shadow-emerald-900/5">
                                <div className="absolute top-8 right-10 text-emerald-200" style={{ transform: 'translateZ(40px)' }}>
                                    <Quote size={40} fill="currentColor" />
                                </div>

                                <div className="flex text-accent-500 mb-6" style={{ transform: 'translateZ(20px)' }}>
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                                </div>

                                <p className="text-gray-700 text-lg font-bold leading-relaxed mb-8 italic opacity-85" style={{ transform: 'translateZ(30px)' }}>
                                    "{review.text}"
                                </p>

                                <div className="flex items-center gap-4" style={{ transform: 'translateZ(50px)' }}>
                                    <img src={review.image} alt={review.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shadow-emerald-950/10" />
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900">{review.name}</h4>
                                        <p className="text-sm font-bold text-primary-700 tracking-wide uppercase">{review.role}</p>
                                    </div>
                                </div>
                            </div>
                        </Tilt>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
