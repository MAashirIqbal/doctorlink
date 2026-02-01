import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/layout/Hero';
import Features from '../../components/layout/Features';
import ProcessSection from '../../components/layout/ProcessSection';
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
                <Features />
                <ProcessSection />
                <AboutSection />
                <Testimonials />
                <FAQ />

                {/* Final CTA Section - Deep Gradient Style */}
                <section className="py-28 relative overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 text-white">
                    {/* Abstract Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-emerald-300 font-black text-sm mb-8 uppercase tracking-widest border border-white/20 backdrop-blur-md">
                            Join the Future
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight font-display leading-[1.1]">
                            Better healthcare, <br />
                            <span className="text-emerald-400">starts right now.</span>
                        </h2>
                        <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto font-bold leading-relaxed opacity-80">
                            Experience the difference with DoctorLink. Professional care is just a few clicks away. Join the thousands who trust us.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button className="bg-primary-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-950/50">
                                Register as Patient
                            </button>
                            <button className="bg-white/5 backdrop-blur-md text-white border-2 border-white/20 hover:bg-white/10 px-12 py-5 rounded-[2rem] font-black text-xl transition-all">
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
