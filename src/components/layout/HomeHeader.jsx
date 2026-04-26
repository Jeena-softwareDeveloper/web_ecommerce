import { motion, AnimatePresence } from 'framer-motion';
import HomeGreeting from './HomeGreeting';
import HomeSearchBar from './HomeSearchBar';

const HomeHeader = ({ isCollapsed, isScrolled, onSearch, onFilter }) => {
    return (
        <div className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ease-in-out ${
            isScrolled 
                ? 'glass shadow-premium' 
                : 'bg-white/80 backdrop-blur-sm'
        }`}>
            <div className="max-w-7xl mx-auto flex flex-col pt-1">
                {/* 1. Brand & Account Row (Hides on scroll down) */}
                <AnimatePresence initial={false}>
                    {!isCollapsed && (
                        <motion.div
                            key="header-greeting"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ 
                                height: 'auto', 
                                opacity: 1,
                                transition: {
                                    height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.3, delay: 0.1 }
                                }
                            }}
                            exit={{ 
                                height: 0, 
                                opacity: 0,
                                transition: {
                                    height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.2 }
                                }
                            }}
                            className="overflow-hidden"
                        >
                            <HomeGreeting />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* 2. Search & Cart Row (Stays sticky) */}
                <div className="pb-1.5 md:pb-2">
                    <HomeSearchBar onSearch={onSearch} onFilter={onFilter} transparent={true} />
                </div>
            </div>
        </div>
    );
};

export default HomeHeader;
