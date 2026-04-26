import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import { get_active_offers } from '../../store/reducers/vendorOfferReducer';

const OfferZone = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { offers, loader } = useSelector(state => state.vendorOffer);



    if (loader && !offers.length) {
        return (
            <div className="px-4 py-6">
                <div className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
            </div>
        );
    }
    
    if (!offers.length) return null;

    return (
        <div className="mb-6 px-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Zap size={20} className="text-[#B91C4A] fill-[#B91C4A]" />
                    <span className="text-lg font-black text-[#0F172A] ml-2 uppercase tracking-tighter">Offer Zone</span>
                </div>
                <button 
                    onClick={() => navigate('/products?search=offer')}
                    className="text-[#B91C4A] text-xs font-bold uppercase hover:underline"
                >
                    View All
                </button>
            </div>

            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-visible no-scrollbar gap-4 md:gap-6 lg:gap-8 -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0 snap-x">
                {offers.map((offer) => (
                    <button
                        key={offer._id}
                        onClick={() => navigate(`/products?campaign=${offer._id}`)}
                        className="flex-shrink-0 w-[85%] md:w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden snap-center transition-all hover:shadow-lg hover:translate-y-[-4px] active:scale-[0.98] text-left"
                    >
                        {/* Offer Header (Pink) */}
                        <div className="p-4 bg-[#B91C4A]">
                            <h3 className="text-white font-black text-lg uppercase leading-5 truncate">
                                {offer.title}
                            </h3>
                            <p className="text-white/80 text-xs font-bold mt-1 truncate">
                                {offer.description}
                            </p>
                        </div>

                        {/* Product Preview Row */}
                        <div className="p-3 flex items-center justify-between bg-gray-50/50">
                            <div className="flex -space-x-4">
                                {(offer.participatingPreview && offer.participatingPreview.length > 0) ? (
                                    offer.participatingPreview.map((p, i) => (
                                        <div
                                            key={p._id || i}
                                            className="w-12 h-12 bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm"
                                            style={{ zIndex: 10 - i }}
                                        >
                                            <img
                                                src={p.images?.[0] || 'https://via.placeholder.com/150'}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    [1, 2, 3].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm"
                                            style={{ zIndex: 10 - i }}
                                        >
                                            <ShieldCheck size={20} className="text-gray-200" />
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Hurry Up!</span>
                                <div className="bg-white px-2 py-0.5 rounded-full border border-gray-100 mt-1 shadow-sm">
                                    <span className="text-[10px] font-black text-[#B91C4A] uppercase italic">Hot Deal</span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OfferZone;
