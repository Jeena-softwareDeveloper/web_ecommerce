import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import apiClient from '../../api/apiClient';

const PersonalizedSection = () => {
    const [products, setProducts] = useState([]);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/wear/home/customer/ai/personalized-recommendations')
            .then(res => {
                setProducts(res.data.products || []);
                setReason(res.data.reason || "Picked just for you");
                setLoading(false);
            })
            .catch(err => {
                console.error("Personalization failed", err);
                setLoading(false);
            });
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <div className="py-6 bg-gradient-to-br from-rose-100/40 via-purple-50/30 to-blue-50/20 border-y border-rose-100/50 my-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200/20 blur-2xl rounded-full -ml-12 -mb-12"></div>
            {/* Section Header */}
            <div className="px-4 flex items-center justify-between mb-5">
                <div className="flex items-center">
                    <div>
                        <h2 className="text-[15px] font-black text-gray-900 tracking-tight uppercase leading-none italic">Recommended For You</h2>
                        <p className="text-[10px] text-red-600 font-bold mt-1 uppercase tracking-widest">{reason}</p>
                    </div>
                </div>
                <button className="bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 px-3 py-1.5 rounded-full text-[10px] font-black text-gray-700 hover:bg-white transition-all">
                    VIEW ALL
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex overflow-x-auto no-scrollbar px-4 space-x-2 items-stretch">
                {products.map((product) => (
                    <div key={product._id} className="w-[calc(50%-4px)] md:w-[210px] flex-shrink-0 transform hover:scale-[1.02] transition-transform">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PersonalizedSection;
