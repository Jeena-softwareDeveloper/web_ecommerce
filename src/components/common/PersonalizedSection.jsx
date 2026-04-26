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
        <div className="py-6 bg-gradient-to-r from-red-50 to-indigo-50 border-y border-red-100 my-4 shadow-sm">
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
            <div className="flex overflow-x-auto no-scrollbar px-4 space-x-4 items-stretch">
                {products.map((product) => (
                    <div key={product._id} className="w-[165px] md:w-[210px] flex-shrink-0 transform hover:scale-[1.02] transition-transform">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PersonalizedSection;
