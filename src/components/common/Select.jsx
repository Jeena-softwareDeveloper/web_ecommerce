import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = ({ label, options, value, onChange, placeholder = "Select an option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="mb-6 relative" ref={dropdownRef}>
            {label && <label className="text-gray-700 font-medium text-xs mb-2 block">{label}</label>}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-50 border rounded-lg p-3.5 text-sm font-medium text-gray-800 flex items-center justify-between transition-all outline-none ${
                    isOpen ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/10' : 'border-gray-100 hover:border-[#7C3AED]/30'
                }`}
            >
                <span className={!value ? 'text-gray-400 font-medium' : ''}>
                    {value || placeholder}
                </span>
                <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#7C3AED]' : ''}`} 
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[100] w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden py-1.5"
                    >
                        {options.map((option, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                                    value === option 
                                        ? 'bg-[#7C3AED] text-white' 
                                        : 'text-gray-700 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED]'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Select;
