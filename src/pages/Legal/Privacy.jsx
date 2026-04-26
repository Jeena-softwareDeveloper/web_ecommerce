import React from 'react';
import { motion } from 'framer-motion';
import CommonHeader from '../../components/layout/CommonHeader';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <CommonHeader title="Privacy Policy" />
            <main className="max-w-4xl mx-auto px-6 py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-100 pb-6">
                        <h1 className="text-2xl font-medium tracking-tight text-black mb-1">Privacy Policy</h1>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Effective Date: April 25, 2024</p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">1. Information We Collect</h2>
                        <p className="leading-relaxed text-[14px]">
                            We collect personal information that you voluntarily provide to us when you register on the Platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. This includes names, phone numbers, email addresses, mailing addresses, and billing information.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">2. Information Automatically Collected</h2>
                        <p className="leading-relaxed text-[14px]">
                            Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Platform. This information is primarily needed to maintain the security and operation of our Platform, and for our internal analytics and reporting purposes.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">3. Use of Your Information</h2>
                        <p className="leading-relaxed text-[14px]">
                            We use personal information collected via our Platform for various business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">4. Sharing Your Information</h2>
                        <p className="leading-relaxed text-[14px]">
                            We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, or Legal Obligations. Specifically, we share info with Vendors for fulfillment and Logistics providers for delivery.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">5. Cookies and Tracking</h2>
                        <p className="leading-relaxed text-[14px]">
                            We may use cookies and similar tracking technologies to access or store information. Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">6. Data Retention</h2>
                        <p className="leading-relaxed text-[14px]">
                            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">7. Security of Your Info</h2>
                        <p className="leading-relaxed text-[14px]">
                            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">8. Privacy Rights</h2>
                        <p className="leading-relaxed text-[14px]">
                            In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">9. Updates to This Notice</h2>
                        <p className="leading-relaxed text-[14px]">
                            We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs italic leading-loose">
                            We value your trust in providing us your Personal Information. Thus we are striving to use commercially acceptable means of protecting it.
                        </p>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default Privacy;
