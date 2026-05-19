import React from 'react';
import { motion } from 'framer-motion';
import CommonHeader from '../../components/layout/CommonHeader';

const Terms = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <CommonHeader title="Terms of Service" />
            <main className="max-w-4xl mx-auto px-6 py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-100 pb-6">
                        <h1 className="text-2xl font-medium tracking-tight text-black mb-1">Terms of Service</h1>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Effective Date: April 25, 2024</p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">1. Agreement to Terms</h2>
                        <p className="leading-relaxed text-[14px]">
                            By using Jeenora (the "Platform"), you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and Jeenora Enterprise. If you disagree with any part of these terms, you must discontinue use immediately.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">2. User Eligibility and Conduct</h2>
                        <p className="leading-relaxed text-[14px]">
                            You must be at least 18 years old to use this Platform. You agree to use the Platform only for lawful purposes. Prohibited activities include, but are not limited to, attempting to hack the system, harassing other users, or posting fraudulent product information.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">3. Account Responsibility</h2>
                        <p className="leading-relaxed text-[14px]">
                            You are responsible for safeguarding your login credentials. Jeenora will not be liable for any loss or damage arising from your failure to protect your password. Any activity conducted through your account will be deemed your responsibility.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">4. Intellectual Property</h2>
                        <p className="leading-relaxed text-[14px]">
                            The Platform's logo, design, text, graphics, and software are the property of Jeenora Enterprise and are protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without express written consent.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">5. Multi-Vendor Dynamics</h2>
                        <p className="leading-relaxed text-[14px]">
                            Jeenora facilitates transactions between independent vendors and buyers. We do not manufacture the products. Vendors are solely responsible for the accuracy of their listings, the quality of their items, and compliance with local laws.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">6. Pricing and Availability</h2>
                        <p className="leading-relaxed text-[14px]">
                            All prices are subject to change without notice. We reserve the right to cancel orders arising from errors in pricing or stock availability. In such cases, a full refund will be issued to your original payment method.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">7. Returns and Refunds</h2>
                        <p className="leading-relaxed text-[14px]">
                            Refunds are processed within 5-7 business days of an approved return request. Items must be returned in their original condition with all tags intact. Some categories, such as intimate wear, may be non-returnable for hygiene reasons.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">8. Limitation of Liability</h2>
                        <p className="leading-relaxed text-[14px]">
                            To the maximum extent permitted by law, Jeenora shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services or products purchased through the Platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">9. Termination</h2>
                        <p className="leading-relaxed text-[14px]">
                            We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or engaged in conduct detrimental to the Platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">10. Governing Law</h2>
                        <p className="leading-relaxed text-[14px]">
                            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs italic leading-loose">
                            Thank you for choosing Jeenora. We are committed to providing a transparent and professional marketplace experience.
                        </p>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default Terms;
