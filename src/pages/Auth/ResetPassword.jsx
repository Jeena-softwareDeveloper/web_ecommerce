import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../api/apiClient';

// ─── FORGOT PASSWORD VIEW ─────────────────────────────────────────────────────
const ForgotPasswordView = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return toast.error('Please enter your email address');
        setLoading(true);
        try {
            await apiClient.post('/wear/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Check Your Email</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                    If <strong className="text-gray-700">{email}</strong> is registered with Jeenora, a password reset link has been sent to that address.
                </p>
                <p className="text-gray-400 text-xs mb-8">The link will expire in <strong>1 hour</strong>.</p>
                <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder or <button onClick={() => setSent(false)} className="text-[#e11955] font-bold">try again</button>.</p>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Forgot Password?</h2>
            <p className="text-gray-500 text-sm text-center mb-8">Enter your registered email and we'll send you a secure reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                    <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-800 outline-none focus:border-[#e11955]/40 focus:ring-4 focus:ring-[#e11955]/10 transition-all"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#e11955] to-[#f97316] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="text-xs text-gray-400 font-bold flex items-center justify-center gap-1 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={12} /> Back to Login
                </Link>
            </div>
        </motion.div>
    );
};

// ─── RESET PASSWORD VIEW ──────────────────────────────────────────────────────
const ResetPasswordView = ({ token, id }) => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const strength = (() => {
        if (newPassword.length === 0) return 0;
        let s = 0;
        if (newPassword.length >= 8) s++;
        if (/[A-Z]/.test(newPassword)) s++;
        if (/[0-9]/.test(newPassword)) s++;
        if (/[^A-Za-z0-9]/.test(newPassword)) s++;
        return s;
    })();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 8) return setError('Password must be at least 8 characters');
        if (newPassword !== confirmPassword) return setError('Passwords do not match');
        setLoading(true);
        try {
            await apiClient.post('/wear/auth/reset-password', { token, id, newPassword });
            setDone(true);
            toast.success('Password reset successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Password Reset!</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">Your password has been updated successfully. You can now login with your new password.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full py-4 bg-gradient-to-r from-[#e11955] to-[#f97316] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all"
                >
                    Continue to Login →
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Set New Password</h2>
            <p className="text-gray-500 text-sm text-center mb-8">Choose a strong password for your Jeenora account.</p>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 mb-5">
                    <AlertCircle size={16} className="shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">New Password</label>
                    <div className="relative">
                        <input
                            id="new-password"
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 pr-12 text-sm font-semibold text-gray-800 outline-none focus:border-[#e11955]/40 focus:ring-4 focus:ring-[#e11955]/10 transition-all"
                            placeholder="Min 8 characters"
                            required
                        />
                        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {newPassword.length > 0 && (
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                                ))}
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${['', 'text-rose-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'][strength]}`}>{strengthLabel}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Confirm Password</label>
                    <div className="relative">
                        <input
                            id="confirm-password"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 pr-12 text-sm font-semibold text-gray-800 outline-none focus:ring-4 focus:ring-[#e11955]/10 transition-all ${
                                confirmPassword && newPassword !== confirmPassword ? 'border-rose-300 focus:border-rose-400' :
                                confirmPassword && newPassword === confirmPassword ? 'border-emerald-300 focus:border-emerald-400' :
                                'border-gray-200 focus:border-[#e11955]/40'
                            }`}
                            placeholder="Re-enter password"
                            required
                        />
                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {confirmPassword && newPassword === confirmPassword && (
                            <CheckCircle size={16} className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500" />
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full py-4 bg-gradient-to-r from-[#e11955] to-[#f97316] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                </button>
            </form>
        </motion.div>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    const isResetMode = !!(token && id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-orange-50/30 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-[0.3em] text-gray-900">JEENORA</h1>
                    <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-1">Account Security</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <AnimatePresence mode="wait">
                        {isResetMode ? (
                            <ResetPasswordView key="reset" token={token} id={id} />
                        ) : (
                            <ForgotPasswordView key="forgot" />
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center text-xs text-gray-400 font-bold mt-6">
                    © {new Date().getFullYear()} Jeenora Enterprise — Secured with 256-bit encryption 🔒
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
