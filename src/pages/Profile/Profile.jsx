import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Package, MapPin, CreditCard, 
    Settings, LogOut, ChevronRight, Wallet,
    ShieldCheck, Bell, MessageSquare, ArrowRight,
    Star, Edit2, Headphones, Activity, Gift, X, Check, Eye, EyeOff, Building, Globe,
    ChevronLeft, RefreshCw, Smartphone, Search
} from 'lucide-react';
import { FaCheckCircle, FaExclamationTriangle, FaUniversity, FaCreditCard } from 'react-icons/fa';
import apiClient from '../../api/apiClient';
import CommonHeader from '../../components/layout/CommonHeader';
import { get_profile, get_notification_settings, update_notification_settings } from '../../store/reducers/profileReducer';
import { logout_user } from '../../store/reducers/authReducer';
import { get_supplier_status } from '../../store/reducers/vendorReducer';

// Subcomponents for Modal UI
const BottomModal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl h-[70vh] md:h-[60vh] flex flex-col md:rounded-3xl md:mb-10"
                >
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
                        <span className="text-lg font-black text-gray-900">{title}</span>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <X size={20} className="text-gray-700" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profileInfo, loader: loading, walletData, notificationSettings: backendNotificationSettings } = useSelector(state => state.profile);
    const { token, userInfo } = useSelector(state => state.auth);
    const { supplierStatus, loader: vendorLoader } = useSelector(state => state.vendor);

    // Modal States (Matching Android)
    const [showBankModal, setShowBankModal] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Form logic states
    const [supportSubmitting, setSupportSubmitting] = useState(false);
    const [privacySettings, setPrivacySettings] = useState({ profileVisibility: 'public', dataSharing: true });

    // Bank Details Form State
    const [bankForm, setBankForm] = useState({
        accountHolderName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        isVerified: false
    });
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);
    const [isIFSCVerified, setIsIFSCVerified] = useState(false);
    const [bankDetailsLoaded, setBankDetailsLoaded] = useState(false);

    useEffect(() => {
        if (token) {
            dispatch(get_profile());
            dispatch(get_notification_settings());
            fetchBankDetails();
        } else {
            navigate('/login');
        }
    }, [dispatch, token, navigate]);

    useEffect(() => {
        if (token) {
            dispatch(get_supplier_status());
        }
    }, [dispatch, token]);

    const fetchBankDetails = async () => {
        try {
            const response = await apiClient.get('/wear/user/bank-details');
            if (response.data.bankDetails) {
                const { bankDetails } = response.data;
                setBankForm({
                    accountHolderName: bankDetails.accountHolderName || '',
                    accountNumber: bankDetails.accountNumber || '',
                    confirmAccountNumber: bankDetails.accountNumber || '',
                    ifscCode: bankDetails.ifsc || '',
                    bankName: bankDetails.bankName || '',
                    branchName: bankDetails.branchName || '',
                    isVerified: bankDetails.isVerified || false
                });
                if (bankDetails.ifsc) setIsIFSCVerified(true);
            }
            setBankDetailsLoaded(true);
        } catch (error) {
            console.error('Failed to fetch bank details', error);
        }
    };

    const handleVerifyIFSC = async () => {
        if (!bankForm.ifscCode || bankForm.ifscCode.length < 11) {
            return toast.error("Enter valid 11-digit IFSC code");
        }
        setIsVerifyingBank(true);
        try {
            const response = await apiClient.post('/wear/supplier/verify-ifsc', { ifscCode: bankForm.ifscCode });
            const { bankDetails } = response.data;
            setBankForm(prev => ({
                ...prev,
                bankName: bankDetails.bank,
                branchName: bankDetails.branch
            }));
            setIsIFSCVerified(true);
            toast.success("IFSC Verified!");
        } catch (error) {
            toast.error(error.response?.data?.error || "IFSC Verification failed");
        } finally {
            setIsVerifyingBank(false);
        }
    };

    const handleSaveBankDetails = async () => {
        if (!bankForm.accountNumber || bankForm.accountNumber !== bankForm.confirmAccountNumber) {
            return toast.error("Account numbers do not match");
        }
        if (!isIFSCVerified) {
            return toast.error("Please verify IFSC code first");
        }

        setIsVerifyingBank(true);
        try {
            // First verify account (mock for now as per controller)
            await apiClient.post('/wear/supplier/verify-bank', {
                accountNumber: bankForm.accountNumber,
                ifscCode: bankForm.ifscCode
            });

            // Then save to user profile
            const response = await apiClient.put('/wear/user/bank-details', {
                bankDetails: {
                    accountHolderName: bankForm.accountHolderName,
                    accountNumber: bankForm.accountNumber,
                    ifscCode: bankForm.ifscCode,
                    bankName: bankForm.bankName,
                    branchName: bankForm.branchName
                }
            });

            setBankForm(prev => ({ ...prev, isVerified: true }));
            toast.success("Bank Details Saved & Verified!");
            setShowBankModal(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save bank details");
        } finally {
            setIsVerifyingBank(false);
        }
    };

    const handleToggleNotification = (id) => {
        const currentSettings = backendNotificationSettings || {
            orderUpdates: true,
            promotions: true,
            pushNotifications: true,
            whatsappNotifications: true,
            emailNotifications: true
        };
        const newSettings = { ...currentSettings, [id]: !currentSettings[id] };
        dispatch(update_notification_settings(newSettings));
    };

    const handleLogoutConfirm = () => {
        dispatch(logout_user());
        navigate('/');
    };

    const renderMenuCard = (title, items) => (
        <div className="bg-white px-2 py-2 mb-6 border-y border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] md:rounded-2xl md:mx-4 md:border-x">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-2 mt-3 pl-3">{title}</h3>
            <div className="space-y-1">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.onPress}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98] hover:bg-gray-50 group`}
                    >
                        <div className="flex items-center">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mr-4 shadow-sm border border-white/50 transition-all group-hover:shadow-md`} style={{ backgroundColor: item.bgColor || '#F8FAFC' }}>
                                {item.icon}
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-extrabold text-gray-800 tracking-tight">{item.label}</h4>
                                {item.subtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{item.subtitle}</p>}
                            </div>
                        </div>
                        <div className="flex items-center">
                            {item.rightContent}
                            <div className="ml-3 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSupplierBanner = () => {
        if (vendorLoader && !supplierStatus) {
            return (
                <div className="w-full h-20 mb-6 bg-gray-200 animate-pulse rounded-xl flex items-center px-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                        <div className="space-y-2">
                            <div className="w-20 h-3 bg-gray-300 rounded" />
                            <div className="w-32 h-2 bg-gray-300 rounded" />
                        </div>
                    </div>
                    <div className="w-16 h-6 bg-gray-300 rounded-lg" />
                </div>
            );
        }

        let config = {
            bg: 'bg-indigo-600', main: 'Open Hub', sub: 'Sell on Jeenora',
            btn: 'OPEN', btnC: 'text-indigo-600',
            action: () => navigate('/supplier-hub')
        };
        if (supplierStatus === 'approved') {
            config = { 
                bg: 'bg-emerald-600', 
                main: 'Open Hub', 
                sub: 'Business Active', 
                btn: 'ACCESS', 
                btnC: 'text-emerald-700', 
                action: () => navigate('/supplier-hub') 
            };
        } else if (supplierStatus === 'pending') {
            config = { 
                bg: 'bg-amber-500', 
                main: 'Open Hub', 
                sub: 'Status: Pending Review', 
                btn: 'REFRESH', 
                btnC: 'text-amber-700', 
                action: () => {
                    dispatch(get_supplier_status());
                    toast.info("Your application is under review. Please wait for 24 hours.");
                }
            };
        } else if (supplierStatus === 'rejected') {
            config = { bg: 'bg-rose-500', main: 'Open Hub', sub: 'Status: Rejected', btn: 'RE-APPLY', btnC: 'text-rose-700', action: () => navigate('/supplier-registration') };
        } else if (supplierStatus === 'suspended') {
            config = { bg: 'bg-slate-600', main: 'Open Hub', sub: 'Status: Suspended', btn: 'SUPPORT', btnC: 'text-slate-700', action: () => navigate('/support') };
        }

        return (
            <button
                onClick={() => {
                    dispatch(get_supplier_status());
                    config.action();
                }}
                className={`${config.bg} w-full px-6 py-6 mb-6 flex items-center justify-between group relative overflow-hidden transition-all active:scale-[0.99] shadow-md border-y border-black/10`}
            >
                {vendorLoader && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse z-0" />
                )}
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Building size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-white text-sm font-black tracking-tight flex items-center gap-2">
                            {config.main}
                            {supplierStatus === 'approved' && <ShieldCheck size={14} className="text-emerald-300" />}
                        </h2>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{config.sub}</p>
                    </div>
                </div>
                <div className="relative z-10 bg-white px-4 py-1.5 rounded-lg shadow-sm">
                    <span className={`font-black text-[10px] uppercase tracking-wider ${config.btnC}`}>{config.btn}</span>
                </div>
            </button>
        );
    };

    if (loading || !profileInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col pt-[115px] md:pt-[130px]">
                <CommonHeader title="" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <CommonHeader title="" />

            <div className="fixed inset-0 z-[-1] opacity-40" style={{ 
                backgroundImage: `
                    radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.1) 0, transparent 50%),
                    radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.1) 0, transparent 50%),
                    radial-gradient(at 50% 50%, rgba(244, 63, 94, 0.05) 0, transparent 80%),
                    radial-gradient(at 0% 100%, rgba(249, 115, 22, 0.1) 0, transparent 50%)
                ` 
            }}></div>

            {/* HEADER (Color-rich & Integrated) */}
            <div className="pt-[48px] md:pt-[60px]">
                <div className="pb-4 px-4 pt-2 relative overflow-hidden">
                    {/* Subtle Glow Effect */}
                    <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center flex-1 cursor-pointer" onClick={() => navigate('/edit-profile')}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-indigo-400 to-rose-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
                                <img src={profileInfo.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-md object-cover bg-white relative z-10" alt="profile" />
                                <div className="absolute bottom-0 right-0 bg-white w-7 h-7 rounded-full flex items-center justify-center border border-gray-100 shadow-sm z-20">
                                    <Edit2 size={12} className="text-primary" />
                                </div>
                            </div>
                            <div className="ml-5 flex-1 flex items-center justify-between">
                                <div>
                                    <h1 className="text-gray-900 text-[20px] font-black tracking-tight">
                                        {profileInfo?.name || userInfo?.name || 'Wear User'}
                                    </h1>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            Online
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(get_profile());
                                        dispatch(get_supplier_status());
                                        toast.success("Profile Refreshed");
                                    }}
                                    className="p-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm active:scale-90 transition-all hover:bg-white"
                                >
                                    <RefreshCw size={18} className={`text-primary ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* QUICK STATS ROW */}
                <div className="flex px-4 space-x-3 mt-2 mb-6 relative z-10 w-full">
                    {[
                        { label: 'My Orders', icon: <Package size={20} className="text-indigo-500" />, iconBg: 'bg-indigo-50', onPress: () => navigate('/orders') },
                        { label: 'Support', icon: <Headphones size={20} className="text-teal-500" />, iconBg: 'bg-teal-50', onPress: () => navigate('/support') }
                    ].map((stat, i) => (
                        <button key={i} onClick={stat.onPress} className="flex-1 bg-white rounded-lg p-3 flex flex-row items-center justify-center shadow-sm border border-gray-50 hover:bg-gray-50 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${stat.iconBg}`}>
                                {stat.icon}
                            </div>
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{stat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="w-full">
                    {renderSupplierBanner()}

                    {renderMenuCard("My Activity", [
                        { label: 'Orders & Refunds', subtitle: 'Manage your shopping history', icon: <Package size={20} className="text-indigo-500" />, bgColor: '#EEF2FF', onPress: () => navigate('/orders') },
                        { label: 'Saved Addresses', subtitle: 'Manage your delivery locations', icon: <MapPin size={20} className="text-amber-500" />, bgColor: '#FFFBEB', onPress: () => navigate('/addresses') },
                        { label: 'Language Settings', subtitle: 'Choose your preferred language', icon: <Globe size={20} className="text-sky-500" />, bgColor: '#F0F9FF', onPress: () => navigate('/language') }
                    ])}

                    {renderMenuCard("Money & Rewards", [
                        { label: 'Bank & UPI Details', subtitle: 'For instant returns & payouts', icon: <Building size={20} className="text-emerald-500" />, bgColor: '#ECFDF5', onPress: () => setShowBankModal(true) },
                        { label: 'Refer & Earn', subtitle: 'Invite friends & get ₹100', icon: <Gift size={20} className="text-amber-500" />, bgColor: '#FFFBEB', onPress: () => { navigator.clipboard.writeText('JEENA100'); toast.success('Referral code copied!'); }, rightContent: <div className="bg-orange-100 px-2 py-1 rounded-md"><span className="text-orange-600 font-bold text-[10px]">REWARDS</span></div> }
                    ])}

                    {renderMenuCard("App Settings", [
                        { label: 'Notification Settings', icon: <Bell size={20} className="text-slate-500" />, bgColor: '#F8FAFC', onPress: () => setShowNotificationModal(true) },
                        { label: 'Security & Privacy', icon: <ShieldCheck size={20} className="text-slate-500" />, bgColor: '#F8FAFC', onPress: () => setShowPrivacyModal(true) },
                        { label: 'Rate our App', icon: <Star size={20} className="text-slate-500" />, bgColor: '#F8FAFC', onPress: () => window.open('https://play.google.com', '_blank') }
                    ])}

                    <div className="py-10 flex flex-col items-center">
                        <span className="text-gray-300 font-black text-xs uppercase tracking-widest">Version 2.4.0 (Jeena Dev Web)</span>
                        <button onClick={() => setShowLogoutModal(true)} className="mt-4 bg-gray-100/80 px-8 py-3 rounded-full hover:bg-gray-200 transition-colors">
                            <span className="text-gray-500 font-black text-xs uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ====== MODALS ====== */}

            {/* Logout Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}>
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-t-[30px] p-6 pb-8 md:rounded-3xl md:mb-10">
                            <div className="flex justify-end mb-2">
                                <button onClick={() => setShowLogoutModal(false)} className="p-2"><X size={24} className="text-gray-400" /></button>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-8 mt-1 tracking-tight">Are you sure you want to logout?</h2>
                            <div className="flex space-x-4">
                                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={handleLogoutConfirm} className="flex-1 py-3.5 bg-[#e11955] text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-rose-100 hover:opacity-90">Logout</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bank Details Modal */}
            <BottomModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Bank & UPI Details">
                <div className="flex flex-col h-full">
                    <p className="text-gray-500 text-xs mb-6 font-medium">Bank details are used for instant refunds and secure payouts.</p>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Account Holder Name</label>
                            <input 
                                type="text" 
                                value={bankForm.accountHolderName}
                                onChange={(e) => setBankForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-emerald-300" 
                                placeholder="As per bank records" 
                            />
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">IFSC Code</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={bankForm.ifscCode}
                                        onChange={(e) => {
                                            setBankForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }));
                                            setIsIFSCVerified(false);
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-emerald-300 uppercase" 
                                        placeholder="SBIN0012345" 
                                    />
                                    {isIFSCVerified && <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                                </div>
                            </div>
                            <div className="pt-6">
                                <button 
                                    onClick={handleVerifyIFSC}
                                    disabled={isVerifyingBank || isIFSCVerified}
                                    className="h-[58px] px-4 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 disabled:opacity-50"
                                >
                                    {isVerifyingBank ? "..." : isIFSCVerified ? "Verified" : "Verify"}
                                </button>
                            </div>
                        </div>

                        {(bankForm.bankName || bankForm.branchName) && (
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                <div className="flex items-start gap-3">
                                    <FaUniversity className="text-emerald-600 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{bankForm.bankName}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">{bankForm.branchName}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Account Number</label>
                            <input 
                                type="password" 
                                value={bankForm.accountNumber}
                                onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-emerald-300" 
                                placeholder="Enter account number" 
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Confirm Account Number</label>
                            <input 
                                type="text" 
                                value={bankForm.confirmAccountNumber}
                                onChange={(e) => setBankForm(prev => ({ ...prev, confirmAccountNumber: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-emerald-300" 
                                placeholder="Re-enter account number" 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveBankDetails}
                        disabled={isVerifyingBank || !isIFSCVerified || !bankForm.accountNumber || bankForm.accountNumber !== bankForm.confirmAccountNumber}
                        className="w-full bg-emerald-600 py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 flex justify-center disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                    >
                        {isVerifyingBank ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save & Verify Account"}
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">100% Secure & Encrypted</span>
                    </div>
                </div>
            </BottomModal>

            {/* Support Modal */}
            <BottomModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} title="Help & Support">
                <p className="text-gray-500 text-sm mb-6 font-medium">How can we help you today? Please describe your issue.</p>
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Subject</label>
                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-rose-300" placeholder="e.g. Order Issue" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Message</label>
                        <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-rose-300 h-32 resize-none" placeholder="Tell us more..."></textarea>
                    </div>
                </div>
                <button 
                    onClick={() => { setSupportSubmitting(true); setTimeout(() => { setSupportSubmitting(false); setShowSupportModal(false); toast.success("Ticket Submitted"); }, 1000); }} 
                    disabled={supportSubmitting}
                    className="w-full bg-[#e11955] py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-100 flex justify-center disabled:opacity-50 hover:bg-rose-600 transition-colors"
                >
                    {supportSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit Ticket"}
                </button>
            </BottomModal>

            {/* Notification Modal */}
            <BottomModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} title="Notification Settings">
                <p className="text-gray-500 text-sm mb-6 font-medium">Manage how you receive notifications</p>
                <div className="space-y-3">
                    {[
                        { id: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about your order status', state: backendNotificationSettings?.orderUpdates },
                        { id: 'whatsappNotifications', label: 'WhatsApp Alerts', desc: 'Direct updates on your WhatsApp', state: backendNotificationSettings?.whatsappNotifications },
                        { id: 'emailNotifications', label: 'Email Notifications', desc: 'Detailed updates via email', state: backendNotificationSettings?.emailNotifications },
                        { id: 'promotions', label: 'Promotions & Offers', desc: 'Receive exclusive deals', state: backendNotificationSettings?.promotions },
                        { id: 'pushNotifications', label: 'Push Notifications', desc: 'Receive app notifications', state: backendNotificationSettings?.pushNotifications },
                    ].map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between pointer-events-auto cursor-pointer" onClick={() => handleToggleNotification(item.id)}>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">{item.label}</h4>
                                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                            </div>
                            <div className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${item.state ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </BottomModal>

            {/* Privacy Modal */}
            <BottomModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Security & Privacy">
                <p className="text-gray-500 text-sm mb-6 font-medium text-left">Control your privacy preferences</p>
                <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800 mb-4">Profile Visibility</h4>
                    <div className="flex space-x-2">
                        <button onClick={() => setPrivacySettings(s => ({ ...s, profileVisibility: 'public' }))} className={`flex-1 py-3 rounded-xl border-2 transition-colors ${privacySettings.profileVisibility === 'public' ? 'bg-[#e11955] border-[#e11955] text-white' : 'bg-white border-gray-100 text-gray-500'}`}>
                            <span className="font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Eye size={14} /> Public</span>
                        </button>
                        <button onClick={() => setPrivacySettings(s => ({ ...s, profileVisibility: 'private' }))} className={`flex-1 py-3 rounded-xl border-2 transition-colors ${privacySettings.profileVisibility === 'private' ? 'bg-[#e11955] border-[#e11955] text-white' : 'bg-white border-gray-100 text-gray-500'}`}>
                            <span className="font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><EyeOff size={14} /> Private</span>
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => setPrivacySettings(s => ({ ...s, dataSharing: !s.dataSharing }))}>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Data Sharing</h4>
                        <p className="text-xs text-gray-500 mt-1">Share data for personalized experience</p>
                    </div>
                    <div className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${privacySettings.dataSharing ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                        <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
            </BottomModal>

        </div>
    );
};

export default Profile;
