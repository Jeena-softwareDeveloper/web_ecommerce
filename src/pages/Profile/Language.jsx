import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';

const Language = ({ desktopEmbedded = false }) => {
    const [selected, setSelected] = useState('English');
    const languages = [
        { name: 'English', native: 'English' },
        { name: 'Tamil', native: 'தமிழ்' },
        { name: 'Hindi', native: 'हिन्दी' },
        { name: 'Malayalam', native: 'മലയാളം' },
        { name: 'Kannada', native: 'ಕನ್ನಡ' }
    ];

    if (desktopEmbedded) {
        return (
            <div>
                <div className="pb-6 mb-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Language Settings</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Select your preferred shopping language across all Jeenora platforms</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <Globe size={14} /> <span>{selected} Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 max-w-2xl mb-8">
                    {languages.map((lang) => (
                        <button 
                            key={lang.name}
                            onClick={() => setSelected(lang.name)}
                            className={`p-6 rounded-2xl border-2 text-left flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer group ${selected === lang.name ? 'border-[#e11955] bg-rose-50/20 shadow-md' : 'border-gray-200 hover:border-indigo-100 bg-white shadow-sm'}`}
                        >
                            <div>
                                <span className="text-base font-black text-gray-900 block tracking-tight">{lang.name}</span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 block">{lang.native}</span>
                            </div>
                            <div className="pt-6 flex justify-end">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selected === lang.name ? 'bg-[#e11955] text-white shadow-sm scale-100' : 'bg-gray-100 text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 scale-90'}`}>
                                    <Check size={12} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="max-w-2xl bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex items-center gap-4">
                    <Globe className="text-indigo-500 shrink-0" size={24} />
                    <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                        Changing the language will immediately update your interface navigation, automated order notifications, and product catalogs where available.
                    </p>
                </div>
            </div>
        );
    }

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
