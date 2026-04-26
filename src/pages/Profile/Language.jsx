import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';

const Language = () => {
    const [selected, setSelected] = useState('English');
    const languages = [
        { name: 'English', native: 'English' },
        { name: 'Tamil', native: 'தமிழ்' },
        { name: 'Hindi', native: 'हिन्दी' },
        { name: 'Malayalam', native: 'മലയാളം' },
        { name: 'Kannada', native: 'ಕನ್ನಡ' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
            <CommonHeader title="Select Language" />
            
            <div className="px-4 py-8 max-w-xl mx-auto w-full">
                <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 divide-y divide-gray-50">
                    {languages.map((lang) => (
                        <button 
                            key={lang.name}
                            onClick={() => setSelected(lang.name)}
                            className="w-full py-6 flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex flex-col items-start ml-2">
                                <span className="text-sm font-black text-secondary tracking-tight">{lang.name}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lang.native}</span>
                            </div>
                            {selected === lang.name && (
                                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                                    <Check size={16} className="text-green-500" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="mt-8 flex items-center gap-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-50">
                    <Globe className="text-blue-400 shrink-0" size={24} />
                    <p className="text-[10px] text-blue-600 font-bold uppercase leading-relaxed tracking-wider">
                        Changing the language will update the app interface and product details where available.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Language;
