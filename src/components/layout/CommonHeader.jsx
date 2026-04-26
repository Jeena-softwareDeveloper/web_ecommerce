import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, ShoppingCart, Search, SlidersHorizontal, Mic, X } from 'lucide-react';

const CommonHeader = ({ 
    title = '', 
    onFilter = null,
    isSearchPage = false,
    searchValue = '',
    setSearchValue = () => {},
    onSearch = () => {}
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalItems } = useSelector(state => state.wearCart || { totalItems: 0 });
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine if cart should show
    const shouldShowCart = 
        location.pathname === '/' || 
        location.pathname.startsWith('/product/') || 
        location.pathname.startsWith('/category/') || 
        location.pathname === '/products' ||
        location.pathname === '/search';

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100/10' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 py-1.5">
                {/* Back */}
                <button 
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-50/50 border border-primary/10 text-gray-800 active:scale-95 transition-transform"
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Title or Search bar */}
                {isSearchPage ? (
                    <div className="flex-1 flex items-center bg-gray-50 border border-primary/5 h-10 px-3 rounded-xl focus-within:bg-white focus-within:border-primary/20 transition-all">
                        <Search size={16} className="text-gray-600 mr-2 flex-shrink-0" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Fashion Search" 
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                            className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-black placeholder:text-gray-500"
                        />
                        {searchValue && (
                            <button onClick={() => setSearchValue('')} className="p-1 text-gray-500 hover:text-gray-800">
                                <X size={14} />
                            </button>
                        )}
                        <button className="p-1 text-primary">
                            <Mic size={16} />
                        </button>
                    </div>
                ) : title ? (
                    <div className="flex-1 flex items-center px-2">
                        <h1 className="text-sm font-bold text-gray-900 truncate">{title}</h1>
                    </div>
                ) : (
                    <button 
                        onClick={() => navigate('/search')}
                        className="flex-1 flex items-center bg-white border border-primary/10 h-10 px-3 rounded-lg text-left active:scale-[0.98] transition-transform min-w-0 shadow-sm hover:border-primary/20"
                    >
                        <Search size={16} className="text-gray-600 mr-2 flex-shrink-0" />
                        <span className="text-[13px] text-gray-700 font-bold truncate">Search products...</span>
                    </button>
                )}

                {/* Filter */}
                {onFilter && (
                    <button 
                        onClick={onFilter}
                        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-50/50 border border-primary/10 text-gray-600 active:scale-95 transition-transform"
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                )}

                {/* Cart */}
                {shouldShowCart && (
                    <button 
                        onClick={() => navigate('/cart')}
                        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-50/50 border border-primary/10 text-primary relative active:scale-95 transition-transform"
                    >
                        <ShoppingCart size={20} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CommonHeader;
