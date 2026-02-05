import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/layout/Hero';
import ProcessSection from '../../components/layout/ProcessSection';
import Features from '../../components/layout/Features';
import AboutSection from '../../components/layout/AboutSection';
import Testimonials from '../../components/layout/Testimonials';
import FAQ from '../../components/layout/FAQ';
import Footer from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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

                {/* Final CTA Section - Emerald Obsidian Finale */}
                <section className="py-32 relative overflow-hidden bg-[#061410]">
                    {/* Mesh Gradient Background Elements */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] opacity-50" />
                        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary-900/30 rounded-full blur-[150px] opacity-40" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
                    </div>

                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 font-black text-xs mb-10 uppercase tracking-[0.3em] backdrop-blur-xl shadow-2xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Next-Gen Healthcare
                        </div>

                        <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none italic uppercase">
                            Your health, <br />
                            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Reimagined.</span>
                        </h2>

                        <p className="text-xl text-emerald-100/60 mb-14 max-w-2xl mx-auto font-bold leading-relaxed tracking-wide">
                            Join over 50,000+ users transforming their lives through Pakistan's most advanced digital wellness ecosystem.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-8">
                            <Link to="/register" className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <button className="relative w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-14 py-6 rounded-2xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                                    Start Journey
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>

                            <Link to="/apply-doctor" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-14 py-6 rounded-2xl font-black text-xl transition-all text-center backdrop-blur-xl hover:border-emerald-500/30 active:scale-95">
                                Join as Specialist
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-20 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center gap-3">
                                <span className="font-black text-white text-lg italic tracking-tighter uppercase whitespace-nowrap">PMC Verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-white text-lg italic tracking-tighter uppercase whitespace-nowrap">ISO 27001</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-white text-lg italic tracking-tighter uppercase whitespace-nowrap">GDPR Compliant</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Bottom Shadow */}
                    <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Landing;
