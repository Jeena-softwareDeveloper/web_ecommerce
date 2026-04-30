import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { register_user, messageClear } from '../../store/reducers/authReducer';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loader: loading, successMessage, errorMessage, token } = useSelector(state => state.auth);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            navigate('/');
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            navigate('/login');
        }
        if (errorMessage) {
            toast.error(errorMessage);
            setError(errorMessage);
            dispatch(messageClear());
        }
    }, [token, successMessage, errorMessage, navigate, dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.username || !form.email || !form.password || !form.phone) {
            setError('Please fill in all fields');
            return;
        }

        dispatch(register_user(form));
    };

    return (
        <div className="h-screen relative font-sans overflow-hidden selection:bg-primary/10 selection:text-primary">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/')}
                className="fixed top-4 left-4 z-[60] h-10 w-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm active:scale-95 transition-all text-secondary"
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
                    className="w-full max-w-[420px] bg-white rounded-2xl p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100"
                >
                    {/* Branding Header */}
                    <div className="flex flex-col items-center text-center mb-5">
                        <h1 className="text-2xl font-medium tracking-tight text-black mb-1">Create Account</h1>
                        <p className="text-slate-500 text-[13px] leading-relaxed">
                            Join Jeenora for a premium shopping journey.
                        </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Username Input */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-medium tracking-widest text-slate-600 ml-1">Username</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                                            <User size={14} />
                                        </div>
                                        <input 
                                            type="text"
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder="johndoe"
                                            className={`w-full bg-gray-50/50 border rounded-lg py-3 pl-9 pr-3 text-black text-xs font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none ${error ? 'border-error' : 'border-gray-100'}`}
                                        />
                                    </div>
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-medium tracking-widest text-slate-600 ml-1">Phone</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                                            <span className="text-[10px] font-medium tracking-tighter text-slate-600">+91</span>
                                        </div>
                                        <input 
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="9876543210"
                                            className={`w-full bg-gray-50/50 border rounded-lg py-3 pl-9 pr-3 text-black text-xs font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none ${error ? 'border-error' : 'border-gray-100'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-medium tracking-widest text-slate-600 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                                        <Mail size={14} />
                                    </div>
                                    <input 
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        className={`w-full bg-gray-50/50 border rounded-lg py-3 pl-9 pr-3 text-black text-xs font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none ${error ? 'border-error' : 'border-gray-100'}`}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase font-medium tracking-widest text-slate-600 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                                        <Lock size={14} />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full bg-gray-50/50 border rounded-lg py-3 pl-9 pr-9 text-black text-xs font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none ${error ? 'border-error' : 'border-gray-100'}`}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || !form.username || !form.email || !form.password || !form.phone}
                            className={`w-full h-12 bg-primary text-white rounded-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span className="text-[13px] font-medium uppercase tracking-widest">Register Now</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center border-t border-gray-50 pt-5">
                        <p className="text-slate-500 text-[12px] font-normal">
                            Already have an account? <Link to="/login" style={{ color: '#D80032' }} className="font-bold hover:opacity-80 transition-colors underline underline-offset-4">Sign in here</Link>
                        </p>
                    </div>
                </motion.div>

                {/* Support & Legal Links */}
                <div className="mt-6 text-center space-y-3">
                    <p className="text-slate-600 text-[11px] font-medium uppercase tracking-widest">
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

export default Register;
