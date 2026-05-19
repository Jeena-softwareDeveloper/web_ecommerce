import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import apiClient from '../../api/apiClient';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | success | already | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const id = searchParams.get('id');

        let isMounted = true;
        const doVerify = async () => {
            if (!token || !id) {
                if (isMounted) {
                    setStatus('error');
                    setMessage('This verification link is invalid or missing information.');
                }
                return;
            }

            try {
                const { data } = await apiClient.get(`/wear/auth/verify-email?token=${token}&id=${id}`);
                if (!isMounted) return;
                if (data.alreadyVerified) {
                    setStatus('already');
                    setMessage('Your email is already verified. You can login normally.');
                } else {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                }
            } catch (err) {
                if (!isMounted) return;
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
            }
        };

        doVerify();
        return () => { isMounted = false; };
    }, [searchParams]);

    const config = {
        loading: { emoji: '⏳', title: 'Verifying...', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-50', text: 'Please wait while we verify your email.' },
        success: { emoji: '✅', title: 'Email Verified!', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: message },
        already: { emoji: '🎉', title: 'Already Verified', color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50', text: message },
        error: { emoji: '❌', title: 'Verification Failed', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: message },
    }[status];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header gradient */}
                    <div className={`bg-gradient-to-r ${config.color} p-10 text-center`}>
                        <div className="text-6xl mb-4">{config.emoji}</div>
                        <h1 className="text-white text-2xl font-black tracking-tight">{config.title}</h1>
                    </div>

                    {/* Body */}
                    <div className="p-8 text-center">
                        <div className={`${config.bg} rounded-2xl p-5 mb-8`}>
                            <p className="text-gray-700 font-semibold text-sm leading-relaxed">{config.text}</p>
                        </div>

                        {status === 'loading' && (
                            <div className="flex justify-center">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                            </div>
                        )}

                        {status !== 'loading' && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-gradient-to-r from-[#e11955] to-[#f97316] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all"
                                >
                                    {status === 'success' ? 'Continue to Login →' : 'Go to Login'}
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Back to Home
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-8 py-4 text-center">
                        <p className="text-xs text-gray-400 font-bold">JEENORA — Secured Email Verification</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
