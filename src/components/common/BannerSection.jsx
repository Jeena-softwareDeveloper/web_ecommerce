import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_active_banners, track_banner_click } from '../../store/reducers/configReducer';

const BannerSection = ({ category = 'home', type = null }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { banners, loader: loadingConfigs } = useSelector(state => state.config);
    
    // Local processing of banners for this specific section instance
    const sectionBanners = banners.filter(b => 
        (b.offerZones?.includes(category) || (category === 'home' && (!b.offerZones || b.offerZones.length === 0))) && 
        (!type || b.bannerType === type)
    );

    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);
    const timerRef = useRef(null);

    // Mouse Drag State
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Auto-Scroll Logic
    useEffect(() => {
        if (sectionBanners.length > 1) {
            startTimer();
        }
        return () => stopTimer();
    }, [sectionBanners.length, activeIndex]);

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            const nextIndex = (activeIndex + 1) % sectionBanners.length;
            scrollToIndex(nextIndex);
        }, 4000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const getBannerWidth = () => {
        // Now standardized: 1 per row on mobile, 3 per row on desktop for all types
        return { class: 'w-full md:w-[32.5%]', multiplier: 1.0 };
    };

    const scrollToIndex = (index) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const width = container.firstElementChild?.offsetWidth || container.offsetWidth;
        const gap = 8;
        container.scrollTo({
            left: index * (width + gap),
            behavior: 'smooth'
        });
        setActiveIndex(index);
    };



    const handleScroll = (e) => {
        const scrollPosition = e.target.scrollLeft;
        const bannerWidth = e.target.firstElementChild?.offsetWidth || e.target.offsetWidth;
        const gap = 8;
        const index = Math.round(scrollPosition / (bannerWidth + gap));
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    // Mouse Drag Handlers
    const handleMouseDown = (e) => {
        setIsDown(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
        stopTimer();
    };

    const handleMouseLeave = () => {
        setIsDown(false);
        if (sectionBanners.length > 1) startTimer();
    };

    const handleMouseUp = () => {
        setIsDown(false);
        if (sectionBanners.length > 1) startTimer();
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleBannerClick = async (banner) => {
        dispatch(track_banner_click(banner._id));
        const { actionType, actionValue } = banner;
        if (actionType === 'category') navigate(`/products?category=${actionValue}`);
        else if (actionType === 'product') navigate(`/product/${actionValue}`);
        else if (actionType === 'search') navigate(`/products?search=${actionValue}`);
        else if (actionType === 'campaign') navigate(`/products?campaign=${actionValue}`);
        else if (actionType === 'none' || !actionType) {
            const campaignId = banner.offerZones?.find(zone => zone !== 'home');
            if (campaignId) navigate(`/products?campaign=${campaignId}`);
        }
    };

    const getBannerHeight = () => {
        if (type === 'mini' || type === 'strip') return 'aspect-[460/110] md:aspect-[460/130]';
        // Hero banner: More compact aspect ratio for mobile
        return 'aspect-[16/7] md:aspect-[460/240]';
    };

    if (loadingConfigs && sectionBanners.length === 0) {
        return (
            <div className="px-4 my-4 flex space-x-2 overflow-hidden">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`flex-shrink-0 ${getBannerWidth().class} ${getBannerHeight()} bg-gray-50 animate-pulse rounded-xl border border-gray-100`}></div>
                ))}
            </div>
        );
    }
    
    if (sectionBanners.length === 0) return null;

    return (
        <div className="my-1 relative group">
            {/* Carousel Container */}
            <div 
                ref={scrollRef}
                className={`flex overflow-x-auto no-scrollbar px-4 gap-2 scroll-smooth cursor-grab active:cursor-grabbing ${isDown ? 'select-none' : ''}`}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {sectionBanners.map((banner, index) => (
                    <button
                        key={banner._id || index}
                        onClick={() => !isDown && handleBannerClick(banner)}
                        className={`flex-shrink-0 ${getBannerWidth().class} ${getBannerHeight()} relative overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-transform active:scale-[0.98]`}
                    >
                        {banner.image ? (
                            <img
                                src={banner.image}
                                alt="banner"
                                className="w-full h-full object-cover pointer-events-none"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <div className="w-6 h-6 border-b-2 border-green-600 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Pagination Dots */}
            {sectionBanners.length > 2 && (
                <div className="flex justify-center items-center space-x-1.5 mt-4">
                    {sectionBanners.map((_, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-300 rounded-full ${
                                activeIndex === index 
                                    ? 'w-4 h-1 bg-gray-800' 
                                    : 'w-1 h-1 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerSection;
