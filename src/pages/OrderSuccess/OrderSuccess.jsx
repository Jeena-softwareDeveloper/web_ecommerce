import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Calendar, ArrowRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId || 'JN-' + Math.floor(Math.random() * 90000 + 10000);

    useEffect(() => {
        // Diwali/Celebration Confetti
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden">
            {/* NO HEADER AS REQUESTED */}
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg text-center relative z-10"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-10 ring-8 ring-white/10"
                >
                    <CheckCircle2 size={56} className="text-white" />
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4 shadow-sm">Order Placed!</h1>
                <p className="text-green-100 font-semibold uppercase tracking-[3px] text-[11px] mb-12 opacity-90">Everything is set for your delivery</p>

                <div className="space-y-4 mb-12 text-left px-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Package className="text-white" size={20} />
                            </div>
                            <span className="text-[11px] font-bold text-green-100 uppercase tracking-wider">Order Reference</span>
                        </div>
                        <div className="pl-14">
                            <span className="font-black text-white text-2xl tracking-tighter break-all block">{orderId}</span>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Calendar className="text-white" size={20} />
                            </div>
                            <span className="text-[11px] font-bold text-green-100 uppercase tracking-wider">Arrival Date</span>
                        </div>
                        <div className="pl-14">
                            <span className="font-black text-white text-2xl tracking-tighter block">4-7 Working Days</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-4 w-full max-w-sm mx-auto">
                    <button 
                        onClick={() => navigate('/orders')}
                        className="w-full bg-white text-green-600 font-black py-5 rounded-2xl shadow-2xl shadow-green-900/20 hover:bg-green-50 transition-all flex items-center justify-center space-x-3 group"
                    >
                        <span className="text-sm uppercase tracking-widest font-bold">Track Package</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-green-500/30 backdrop-blur-sm text-white font-bold py-4 rounded-2xl border border-white/20 hover:bg-green-500/40 transition-all flex items-center justify-center space-x-2"
                    >
                        <Home size={16} />
                        <span className="text-xs uppercase tracking-widest">Return Home</span>
                    </button>
                </div>

                <p className="mt-12 text-[10px] text-green-100 font-medium px-10 opacity-80 leading-relaxed">
                    A confirmation email and SMS have been sent. <br/>
                    <span className="text-white font-bold">Thank you for shopping with Jeenora Fashion!</span>
                </p>
            </motion.div>

            {/* Background Decorative Elements */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
    );
};

export default OrderSuccess;
