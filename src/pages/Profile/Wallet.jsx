import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Gift, Clock } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';

const Wallet = () => {
    const { walletData } = useSelector(state => state.profile);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
            <CommonHeader title="My Wallet" />
            
            <div className="px-4 py-6 max-w-2xl mx-auto w-full">
                {/* Balance Card */}
                <div className="bg-[#1a1a1a] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl mb-8">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-[4px] block mb-2">Available Balance</span>
                        <h2 className="text-4xl font-black mb-6 tracking-tight">₹{walletData?.balance || '0.00'}</h2>
                        
                        <div className="flex gap-4">
                            <button className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                                <Plus size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Add Money</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                            <Gift size={20} className="text-indigo-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rewards</span>
                        <h4 className="text-lg font-black text-secondary">₹{walletData?.rewards || '0'}</h4>
                    </div>
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                            <ArrowDownLeft size={20} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Cashback</span>
                        <h4 className="text-lg font-black text-secondary">₹{walletData?.cashback || '0'}</h4>
                    </div>
                </div>

                {/* History */}
                <h3 className="text-[12px] font-black text-secondary uppercase tracking-[4px] mb-4 ml-2">Recent Activity</h3>
                <div className="space-y-3">
                    {walletData?.recentTransactions?.length > 0 ? (
                        walletData.recentTransactions.map((tx, i) => (
                            <div key={i} className="bg-white rounded-3xl p-5 flex items-center justify-between border border-gray-100 shadow-sm">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-secondary tracking-tight">{tx.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={`font-black text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 opacity-40">
                            <Clock size={32} className="mx-auto mb-3" />
                            <p className="text-xs font-black uppercase tracking-widest">No recent transactions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple Plus icon fallback if lucide-react version differs
const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default Wallet;
