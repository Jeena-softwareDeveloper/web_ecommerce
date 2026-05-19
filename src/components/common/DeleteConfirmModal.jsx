import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Catalog",
    subtitle = "Confirm permanent action",
    message = "Are you sure you want to delete this catalog? This action is permanent and cannot be undone.",
    confirmText = "Yes, Delete",
    cancelText = "Cancel"
}) => {
    // Determine if we're on mobile for bottom-sheet vs center-modal rendering
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="fixed inset-0 bg-black/60 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
                    onClick={onClose}>
                    <motion.div 
                        initial={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0, y: 10 }} 
                        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }} 
                        exit={isMobile ? { y: "100%" } : { scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full rounded-t-[24px] sm:rounded-lg max-w-[400px] shadow-2xl overflow-hidden p-6 flex flex-col shrink-0"
                    >
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0 mx-auto sm:mx-0">
                                <Trash2 size={24} />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-black text-gray-900 leading-tight">{title}</h3>
                                <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-wider mt-1">{subtitle}</p>
                            </div>
                        </div>
                        
                        <div className="text-center sm:text-left mb-7">
                            <p className="text-[13px] font-semibold text-gray-600 leading-relaxed">
                                {message}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                            <button 
                                onClick={onClose}
                                className="w-full sm:flex-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-bold text-[13px] py-3.5 transition-all active:scale-95 cursor-pointer text-center"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={onConfirm}
                                className="w-full sm:flex-[1.5] bg-[#E11D48] hover:bg-rose-700 text-white rounded-2xl font-black text-[13px] py-3.5 shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer text-center"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DeleteConfirmModal;
