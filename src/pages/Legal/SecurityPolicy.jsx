import React from 'react';
import { motion } from 'framer-motion';
import CommonHeader from '../../components/layout/CommonHeader';

const SecurityPolicy = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <CommonHeader title="Security Policy" />
            <main className="max-w-4xl mx-auto px-6 py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="border-b border-gray-100 pb-6">
                        <h1 className="text-2xl font-medium tracking-tight text-black mb-1">Security Policy</h1>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Effective Date: April 25, 2024</p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">1. Infrastructure Security</h2>
                        <p className="leading-relaxed text-[14px]">
                            Our platform is hosted on secure, enterprise-grade cloud servers with multi-layer firewall protection. We utilize Virtual Private Clouds (VPC) to isolate sensitive data and ensure that our internal systems are not directly exposed to the public internet.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">2. Encryption Standards</h2>
                        <p className="leading-relaxed text-[14px]">
                            All data transmitted between your browser and our servers is encrypted using Secure Socket Layer (SSL/TLS) technology. We also implement encryption at rest for sensitive database fields, ensuring that your personal information remains unreadable even in storage.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">3. Payment Integrity</h2>
                        <p className="leading-relaxed text-[14px]">
                            Jeenora is fully compliant with PCI-DSS standards through our payment partners. We do not store or process your credit card numbers directly. Transactions are handled through secure tokens, providing an additional layer of safety for your financial data.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">4. Authentication & Authorization</h2>
                        <p className="leading-relaxed text-[14px]">
                            We use advanced hashing algorithms to store your passwords. Our system includes session management security to prevent unauthorized access. We also monitor login attempts to identify and block brute-force attacks in real-time.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">5. Vulnerability Management</h2>
                        <p className="leading-relaxed text-[14px]">
                            We conduct regular automated scans and manual security audits of our codebase. Our development team follows industry best practices (OWASP) to prevent common web vulnerabilities like SQL injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">6. Data Backups</h2>
                        <p className="leading-relaxed text-[14px]">
                            We maintain encrypted, redundant backups of all critical data. These backups are stored in geographically separate locations to ensure data availability and recovery in the event of a natural disaster or system failure.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">7. Personnel Security</h2>
                        <p className="leading-relaxed text-[14px]">
                            Access to customer data is strictly limited to authorized personnel who require it to perform their jobs. All employees and contractors are subject to background checks and must sign strict non-disclosure agreements.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">8. Incident Response</h2>
                        <p className="leading-relaxed text-[14px]">
                            In the unlikely event of a security breach, we have a comprehensive incident response plan in place. This includes immediate containment, thorough investigation, and prompt notification to affected users as required by law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-medium text-black">9. Reporting Vulnerabilities</h2>
                        <p className="leading-relaxed text-[14px]">
                            If you discover a potential security vulnerability on our platform, we encourage you to report it to us immediately at security@jeenora.com. We appreciate your help in keeping our community safe.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs italic leading-loose">
                            Your security is our top priority. We continuously evolve our safety measures to stay ahead of emerging digital threats.
                        </p>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default SecurityPolicy;
