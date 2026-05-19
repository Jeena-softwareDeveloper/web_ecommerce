import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ArrowLeft, Mic, X, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { 
    get_search_suggestions, 
    get_search_history, 
    save_search_query, 
    get_trending_data 
} from '../../store/reducers/wearProductReducer';

const Loader = () => (
    <div className="flex space-x-2">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3 h-3 bg-primary rounded-full" />
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-3 h-3 bg-primary rounded-full" />
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-3 h-3 bg-primary rounded-full" />
    </div>
);

const Search = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { 
        suggestions, 
        loader: loading, 
        searchHistory, 
        trendingQueries, 
        trendingProducts 
    } = useSelector(state => state.wearProduct);

    const [searchText, setSearchText] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        dispatch(get_search_history('web_session'));
        dispatch(get_trending_data());
        inputRef.current?.focus();
    }, [dispatch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchText.trim()) {
                dispatch(get_search_suggestions(searchText));
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [searchText, dispatch]);

    const handleSearch = (query) => {
        const q = typeof query === 'string' ? query : searchText;
        if (q.trim()) {
            dispatch(save_search_query({ q, deviceId: 'web_session' }));
            navigate(`/products?search=${encodeURIComponent(q)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[54px]">
            <CommonHeader 
                isSearchPage={true}
                searchValue={searchText}
                setSearchValue={setSearchText}
                onSearch={handleSearch}
            />
            
            <div className="flex-1 w-full px-4 pt-6 pb-8 md:px-8 md:pt-10">

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <AnimatePresence mode="wait">
                            {searchText && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <SearchIcon size={14} strokeWidth={3} />
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Suggestions for "{searchText}"</h2>
                                    </div>
                                    <div className="space-y-2">
                                        {loading ? (
                                            <div className="p-12 flex justify-center bg-white rounded-3xl border border-gray-100"><Loader /></div>
                                        ) : suggestions.length > 0 ? suggestions.map((item, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => {
                                                    if (item.type === 'product' && item._id) {
                                                        navigate(`/product/${item._id}`);
                                                    } else {
                                                        handleSearch(item.name || item);
                                                    }
                                                }} 
                                                className="w-full flex items-center bg-white p-2.5 rounded-2xl border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all group"
                                            >
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-50 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><SearchIcon size={16} className="text-gray-300" /></div>
                                                    )}
                                                </div>
                                                <div className="ml-4 text-left flex-1">
                                                    <p className="text-[13px] font-bold text-black line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase">
                                                        {typeof item === 'string' ? item : item.name}
                                                    </p>
                                                    {item.price > 0 && (
                                                        <p className="text-[11px] font-black text-primary mt-0.5 tracking-tighter">
                                                            ₹{item.price}
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-primary transition-transform group-hover:translate-x-1 mr-2" />
                                            </button>
                                        )) : (
                                            <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-gray-600 font-bold text-sm">
                                                No matches found for "{searchText}"
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!searchText && searchHistory.length > 0 && (
                            <section>
                                <div className="flex items-center space-x-2 mb-4 text-primary"><Clock size={16} strokeWidth={2} /><h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Recent Searches</h2></div>
                                <div className="flex flex-wrap gap-3">{searchHistory.map((item, idx) => (<button key={idx} onClick={() => handleSearch(item)} className="bg-white px-5 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-900 hover:border-primary hover:text-primary transition-all">{item}</button>))}</div>
                            </section>
                        )}

                        {!searchText && trendingQueries.length > 0 && (
                            <section>
                                <div className="flex items-center space-x-2 mb-4 text-rose-500"><TrendingUp size={16} strokeWidth={2} /><h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Trending Now</h2></div>
                                <div className="flex flex-wrap gap-3">{trendingQueries.map((query, idx) => (<button key={idx} onClick={() => handleSearch(query)} className="bg-rose-50 text-rose-700 px-5 py-2.5 rounded-2xl border border-rose-100 text-sm font-bold hover:bg-rose-100 transition-all uppercase tracking-tighter">#{query.replace(/\s+/g, '')}</button>))}</div>
                            </section>
                        )}
                    </div>

                    {!searchText && trendingProducts.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4 text-gray-900">
                                <TrendingUp size={16} strokeWidth={2} className="text-primary" />
                                <h2 className="text-xs font-bold uppercase tracking-widest">Hottest Items</h2>
                            </div>
                            <div className="space-y-3">
                                {trendingProducts.map((item) => (
                                    <button key={item._id} onClick={() => navigate(`/product/${item._id}`)} className="w-full flex items-center p-3 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all group">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-50 flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <img src={item.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="ml-4 text-left">
                                            <p className="text-[13px] font-bold text-black line-clamp-1 group-hover:text-primary transition-colors tracking-tight uppercase">
                                                {item.title}
                                            </p>
                                            <p className="text-sm font-black text-primary mt-0.5 tracking-tighter">
                                                ₹{item.price}
                                            </p>
                                        </div>
                                        <div className="ml-auto bg-rose-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrendingUp size={12} className="text-rose-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
