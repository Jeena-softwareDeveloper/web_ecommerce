import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { login_user, messageClear } from '../../store/reducers/authReducer';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loader: loading, successMessage, errorMessage, token } = useSelector(state => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            navigate('/');
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            setError(errorMessage);
            dispatch(messageClear());
        }
    }, [token, successMessage, errorMessage, navigate, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        dispatch(login_user({ email, password }));
    };

    return (
        <div className="h-screen relative font-sans overflow-hidden selection:bg-primary/10 selection:text-primary">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/')}
                className="fixed top-4 left-4 z-[60] h-10 w-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100 shadow-sm active:scale-95 transition-all text-secondary hover:border-primary/20"
            >
                <ArrowLeft size={20} />
            </button>

            {/* Mesh Background */}
            <div className="fixed inset-0 z-[-1] bg-fk-gray" style={{ 
                backgroundImage: `
                    radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.05) 0, transparent 50%),
                    radial-gradient(at 100% 0%, #e6eeff 0, transparent 50%), 
                    radial-gradient(at 0% 100%, #ffe9e8 0, transparent 50%)
                ` 
            }}></div>

            {/* Main Content */}
            <main className="h-full flex flex-col items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[420px] bg-white rounded-2xl p-8 md:p-10 relative shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100"
                >
                    {/* Branding Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <h1 className="text-3xl font-medium tracking-tight text-black mb-2">Welcome Back</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Sign in to continue shopping.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-medium tracking-[0.15em] text-slate-600 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                        <Mail size={16} />
                                    </div>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className={`w-full bg-gray-50/50 border rounded-lg py-3.5 pl-11 pr-5 text-black text-sm font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none ${error ? 'border-error' : 'border-gray-100'}`}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] uppercase font-bold tracking-[0.15em] text-slate-700 ml-1">Password</label>
                                    <Link to="/forgot-password" style={{ color: '#D80032' }} className="text-[11px] font-bold hover:opacity-70 transition-opacity uppercase tracking-widest">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                        <Lock size={16} />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full bg-gray-50/50 border rounded-lg py-3.5 pl-11 pr-11 text-black text-sm font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none ${error ? 'border-error' : 'border-gray-100'}`}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !email || !password}
                            className={`w-full h-14 bg-primary text-white rounded-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span className="text-[14px] font-medium uppercase tracking-widest">Login Now</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-50 pt-6">
                        <p className="text-slate-500 text-[13px] font-normal">
                            Don't have an account? <Link to="/register" style={{ color: '#D80032' }} className="font-bold hover:opacity-80 transition-colors underline underline-offset-4">Create Account</Link>
                        </p>
                    </div>
                </motion.div>

                {/* Support & Legal Links */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-slate-700 text-[11px] font-medium uppercase tracking-widest">
                        Need assistance? <Link to="/support" className="text-primary hover:opacity-80 transition-colors">Contact Support</Link>
                    </p>
                    
                    <div className="flex items-center justify-center gap-6">
                        <Link className="text-[10px] tracking-wide text-slate-800 font-normal hover:text-primary transition-colors" to="/terms">Terms</Link>
                        <Link className="text-[10px] tracking-wide text-slate-800 font-normal hover:text-primary transition-colors" to="/privacy">Privacy</Link>
                        <Link className="text-[10px] tracking-wide text-slate-800 font-normal hover:text-primary transition-colors" to="/security-policy">Security Policy</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
