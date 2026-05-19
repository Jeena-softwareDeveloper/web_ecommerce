import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, RefreshCw } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, status, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="fixed inset-0 bg-black/60 z-[100] flex flex-col justify-end"
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }} 
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
                        className="bg-white rounded-t-[30px] p-6 shadow-2xl relative w-full pb-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                            <X size={20} />
                        </button>
                        
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={24} className="text-[#7C3AED]" />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">Move to {status?.toUpperCase()}?</h3>
                        <p className="text-xs text-gray-500 font-normal mb-8 pr-12 leading-relaxed">
                            Are you sure you want to update this order's status to <span className="font-semibold text-gray-700">{status}</span>?
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 bg-gray-50 text-gray-600 font-medium text-sm py-3 rounded-lg active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex-[2] bg-[#7C3AED] text-white font-semibold text-sm py-3 rounded-lg shadow-md shadow-indigo-100 active:scale-95 transition-transform flex justify-center items-center"
                            >
                                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Confirm Status'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
