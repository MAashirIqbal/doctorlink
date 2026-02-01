import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/layout/Hero';
import ProcessSection from '../../components/layout/ProcessSection';
import Features from '../../components/layout/Features';
import AboutSection from '../../components/layout/AboutSection';
import Testimonials from '../../components/layout/Testimonials';
import FAQ from '../../components/layout/FAQ';
import Footer from '../../components/layout/Footer';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                <Hero />
                <ProcessSection />
                <Features />
                <AboutSection />
                <Testimonials />
                <FAQ />

                {/* Final CTA Section - Refined Gradient Flow */}
                <section className="py-28 relative overflow-hidden bg-gradient-to-b from-white via-primary-50 to-primary-950">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />

                    {/* Abstract Decorative Elements */}
                    <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-5xl mx-auto px-4 text-center relative z-10 pt-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-100/50 text-primary-800 font-black text-sm mb-8 uppercase tracking-widest border border-primary-200 backdrop-blur-md">
                            Join the Future
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight font-display leading-[1.1]">
                            Better healthcare, <br />
                            <span className="text-primary-700">starts right now.</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-bold leading-relaxed opacity-80">
                            Experience the difference with DoctorLink. Professional care is just a few clicks away. Join the thousands who trust us.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button className="bg-primary-700 hover:bg-primary-800 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary-700/30">
                                Register as Patient
                            </button>
                            <button className="bg-white text-gray-900 border-2 border-gray-100 hover:border-primary-200 px-12 py-5 rounded-2xl font-black text-xl transition-all">
                                Join as Specialist
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Landing;
