import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/layout/Hero';
import Features from '../../components/layout/Features';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                <Hero />
                <Features />

                {/* CTA Section */}
                <section className="py-24 bg-primary-600 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
                    </div>

                    <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">
                            Ready to meet your next doctor?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of patients who have already transformed their healthcare experience with DoctorLink.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-xl">
                                Register as Patient
                            </button>
                            <button className="bg-primary-500 text-white border-2 border-primary-400 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-primary-400 transition-all hover:scale-105 active:scale-95">
                                Join as Doctor
                            </button>
                        </div>
                    </div>
                </section>

                {/* Simple Footer */}
                <footer className="py-12 border-t border-gray-100 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-gray-500 font-medium">
                            © 2026 DoctorLink. Built with passion for better healthcare.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Landing;
