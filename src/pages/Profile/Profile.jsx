import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Package, MapPin, 
    Settings, LogOut, ChevronRight,
    ShieldCheck, Bell,
    Headphones, Gift, X, Eye, EyeOff, Building, Globe,
    RefreshCw, Mail, ShieldAlert, Camera, Save, Loader2, Navigation, Phone
} from 'lucide-react';
import { FaCheckCircle, FaUniversity } from 'react-icons/fa';
import apiClient from '../../api/apiClient';
import CommonHeader from '../../components/layout/CommonHeader';
import { get_profile, get_notification_settings, update_notification_settings, update_profile, profile_image_upload, messageClear } from '../../store/reducers/profileReducer';
import { logout_user } from '../../store/reducers/authReducer';
import { get_supplier_status } from '../../store/reducers/vendorReducer';

// Imported Embedded Pages for Desktop Right Column
import Orders from '../Orders/Orders';
import Addresses from './Addresses';
import Language from './Language';

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
    const fileInputRef = useRef(null);

    const { profileInfo, loader: loading, notificationSettings: backendNotificationSettings, successMessage, errorMessage } = useSelector(state => state.profile);
    const { token, userInfo } = useSelector(state => state.auth);
    const { supplierStatus, loader: vendorLoader } = useSelector(state => state.vendor);

    // Desktop Dual-Column Tab State: 'profile', 'orders', 'addresses', 'language', 'bank', 'refer', 'notifications', 'privacy'
    const [activeDesktopTab, setActiveDesktopTab] = useState('profile');

    // Form logic states
    const [profileFormData, setProfileFormData] = useState({
        name: profileInfo?.name || userInfo?.name || '',
        phone: profileInfo?.phone || '',
        pincode: profileInfo?.pincode || '',
        city: profileInfo?.city || '',
        state: profileInfo?.state || ''
    });
    const [imagePreview, setImagePreview] = useState(profileInfo?.image || null);
    const [isDetecting, setIsDetecting] = useState(false);

    // Modal States (Matching Android)
    const [showBankModal, setShowBankModal] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [supportSubmitting, setSupportSubmitting] = useState(false);
    const [privacySettings, setPrivacySettings] = useState({ profileVisibility: 'public', dataSharing: true });
    const [verifyLoading, setVerifyLoading] = useState(false);

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
    const [originalBankData, setOriginalBankData] = useState({ accountNumber: '', ifscCode: '' });
    const [isEditingBank, setIsEditingBank] = useState(false);

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

    useEffect(() => {
        if (profileInfo) {
            setProfileFormData({
                name: profileInfo.name || userInfo?.name || '',
                phone: profileInfo.phone || '',
                pincode: profileInfo.pincode || '',
                city: profileInfo.city || '',
                state: profileInfo.state || ''
            });
            setImagePreview(profileInfo.image || null);
        }
    }, [profileInfo, userInfo]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const handleProfileInput = (e) => setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);

            const uploadData = new FormData();
            uploadData.append('image', file);
            dispatch(profile_image_upload(uploadData));
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (!profileFormData.name?.trim()) return toast.error("Name is required");
        dispatch(update_profile(profileFormData));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) return toast.error("Geolocation not supported");
        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await apiClient.get('/wear/delivery/pincode', {
                    params: { lat: latitude, lng: longitude }
                });
                if (res.data?.success) {
                    setProfileFormData(prev => ({
                        ...prev,
                        pincode: res.data.pincode || prev.pincode,
                        city: res.data.city || prev.city,
                        state: res.data.state || prev.state
                    }));
                    toast.success("Location auto-detected!");
                }
            } catch (err) {
                toast.error("Location detection failed");
            } finally {
                setIsDetecting(false);
            }
        }, () => {
            setIsDetecting(false);
            toast.error("Location access denied");
        });
    };

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
                setIsEditingBank(!(bankDetails.isVerified));
                setOriginalBankData({
                    accountNumber: bankDetails.accountNumber || '',
                    ifscCode: bankDetails.ifsc || ''
                });
            }
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
            setBankForm(prev => ({ ...prev, bankName: bankDetails.bank, branchName: bankDetails.branch }));
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

        const isDataChanged = bankForm.accountNumber !== originalBankData.accountNumber || 
                             bankForm.ifscCode !== originalBankData.ifscCode;

        setIsVerifyingBank(true);
        try {
            if (!bankForm.isVerified || isDataChanged) {
                await apiClient.post('/wear/supplier/verify-bank', { accountNumber: bankForm.accountNumber, ifscCode: bankForm.ifscCode });
            }

            await apiClient.put('/wear/user/bank-details', {
                bankDetails: {
                    accountHolderName: bankForm.accountHolderName,
                    accountNumber: bankForm.accountNumber,
                    ifscCode: bankForm.ifscCode,
                    bankName: bankForm.bankName,
                    branchName: bankForm.branchName
                }
            });

            setBankForm(prev => ({ ...prev, isVerified: true }));
            setIsEditingBank(false);
            setOriginalBankData({ accountNumber: bankForm.accountNumber, ifscCode: bankForm.ifscCode });
            toast.success(bankForm.isVerified && !isDataChanged ? "Bank Details Updated!" : "Bank Details Saved & Verified!");
            setShowBankModal(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save bank details");
        } finally {
            setIsVerifyingBank(false);
        }
    };

    const handleToggleNotification = (id) => {
        const currentSettings = backendNotificationSettings || { orderUpdates: true, promotions: true, pushNotifications: true, whatsappNotifications: true, emailNotifications: true };
        const newSettings = { ...currentSettings, [id]: !currentSettings[id] };
        dispatch(update_notification_settings(newSettings));
    };

    const handleLogoutConfirm = () => {
        dispatch(logout_user());
        navigate('/');
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (!deletePassword) return toast.error('Please enter your password');

        setIsDeleting(true);
        try {
            const { data } = await apiClient.post('/wear/auth/delete-account', { password: deletePassword });
            if (data.success) {
                toast.success('Account deleted successfully');
                dispatch(logout_user());
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResendVerification = async () => {
        setVerifyLoading(true);
        try {
            await apiClient.post('/wear/auth/resend-verification');
            toast.success('Verification email sent! Check your inbox.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send email. Try again.');
        } finally {
            setVerifyLoading(false);
        }
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
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-sm border border-white/50 transition-all group-hover:shadow-md`} style={{ backgroundColor: item.bgColor || '#F8FAFC' }}>
                                {item.icon}
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-gray-800 tracking-tight">{item.label}</h4>
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

        let config = { bg: 'bg-indigo-600', main: 'Open Hub', sub: 'Sell on Jeenora', btn: 'OPEN', btnC: 'text-indigo-600', action: () => navigate('/supplier-hub') };
        if (supplierStatus === 'approved') {
            config = { bg: 'bg-emerald-600', main: 'Open Hub', sub: 'Business Active', btn: 'ACCESS', btnC: 'text-emerald-700', action: () => navigate('/supplier-hub') };
        } else if (supplierStatus === 'pending') {
            config = { bg: 'bg-amber-500', main: 'Open Hub', sub: 'Status: Pending Review', btn: 'REFRESH', btnC: 'text-amber-700', action: () => { dispatch(get_supplier_status()); toast.info("Your application is under review. Please wait for 24 hours."); } };
        } else if (supplierStatus === 'rejected') {
            config = { bg: 'bg-rose-500', main: 'Open Hub', sub: 'Status: Rejected', btn: 'RE-APPLY', btnC: 'text-rose-700', action: () => navigate('/supplier-registration') };
        } else if (supplierStatus === 'suspended') {
            config = { bg: 'bg-slate-600', main: 'Open Hub', sub: 'Status: Suspended', btn: 'SUPPORT', btnC: 'text-slate-700', action: () => navigate('/support') };
        }

        return (
            <button onClick={() => { dispatch(get_supplier_status()); config.action(); }} className={`${config.bg} w-full px-6 py-6 mb-6 flex items-center justify-between group relative overflow-hidden transition-all active:scale-[0.99] shadow-md border-y border-black/10 md:rounded-2xl cursor-pointer`}>
                {vendorLoader && <div className="absolute inset-0 bg-white/10 animate-pulse z-0" />}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Building size={20} className="text-white" /></div>
                    <div>
                        <h2 className="text-white text-sm font-black tracking-tight flex items-center gap-2">{config.main} {supplierStatus === 'approved' && <ShieldCheck size={14} className="text-emerald-300" />}</h2>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{config.sub}</p>
                    </div>
                </div>
                <div className="relative z-10 bg-white px-4 py-1.5 rounded-lg shadow-sm flex items-center justify-center"><span className={`font-black text-[10px] uppercase tracking-wider ${config.btnC}`}>{config.btn}</span></div>
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

            {/* ====== 1. MOBILE VIEW (Flawless Original Layout) ====== */}
            <div className="md:hidden pt-[48px]">
                <div className="pb-4 px-4 pt-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center flex-1 cursor-pointer" onClick={() => navigate('/edit-profile')}>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-indigo-400 to-rose-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
                                {profileInfo.image ? (
                                    <img src={profileInfo.image} className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-md object-cover bg-white relative z-10" alt="profile" />
                                ) : (
                                    <div className="w-[88px] h-[88px] rounded-full border-4 border-white shadow-md bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center relative z-10 text-primary border-white">
                                        <span className="text-3xl font-black uppercase tracking-tighter">
                                            {(profileInfo?.name || userInfo?.name || 'W').charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 bg-white w-7 h-7 rounded-full flex items-center justify-center border border-gray-100 shadow-sm z-20">
                                    <Camera size={12} className="text-primary" />
                                </div>
                            </div>
                            <div className="ml-5 flex-1 flex items-center justify-between">
                                <div>
                                    <h1 className="text-gray-900 text-[20px] font-black tracking-tight">
                                        {profileInfo?.name || userInfo?.name || 'Wear User'}
                                    </h1>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Online</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); dispatch(get_profile()); dispatch(get_supplier_status()); toast.success("Profile Refreshed"); }} className="p-3 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm active:scale-90 transition-all hover:bg-white">
                                    <RefreshCw size={18} className={`text-primary ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {profileInfo?.email && profileInfo?.emailVerified === false && (
                    <div className="mx-4 mb-4 flex items-center gap-3">
                        <button onClick={handleResendVerification} disabled={verifyLoading} className="flex-1 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left disabled:opacity-60">
                            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                {verifyLoading ? <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" /> : <ShieldAlert size={18} className="text-amber-600" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-amber-800">Email not verified</p>
                                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{verifyLoading ? 'Sending link...' : 'Tap to send a verification link'}</p>
                            </div>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); window.open("https://mail.google.com", "_blank"); }} className="w-12 h-[68px] bg-white border border-amber-200 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all hover:bg-amber-50">
                            <Mail size={20} className="text-amber-500" />
                        </button>
                    </div>
                )}

                <div className="flex px-4 space-x-3 mt-2 mb-6 relative z-10 w-full">
                    {[
                        { label: 'My Orders', icon: <Package size={20} className="text-indigo-500" />, iconBg: 'bg-indigo-50', onPress: () => navigate('/orders') },
                        { label: 'Support', icon: <Headphones size={20} className="text-teal-500" />, iconBg: 'bg-teal-50', onPress: () => navigate('/support') }
                    ].map((stat, i) => (
                        <button key={i} onClick={stat.onPress} className="flex-1 bg-white rounded-lg p-3 flex flex-row items-center justify-center shadow-sm border border-gray-200 hover:border-primary/20 hover:bg-gray-50 transition-all active:scale-95">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${stat.iconBg}`}>{stat.icon}</div>
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
                        { label: 'Security & Privacy', icon: <ShieldCheck size={20} className="text-slate-500" />, bgColor: '#F8FAFC', onPress: () => setShowPrivacyModal(true) }
                    ])}

                    <div className="py-10 flex flex-col items-center">
                        <span className="text-gray-300 font-black text-xs uppercase tracking-widest">Version 2.4.0 (Jeena Dev Web)</span>
                        <button onClick={() => setShowLogoutModal(true)} className="mt-4 bg-gray-100/80 px-8 py-3 rounded-full hover:bg-gray-200 transition-colors">
                            <span className="text-gray-500 font-black text-xs uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ====== 2. DESKTOP VIEW (Premium Flipkart Dual-Column Layout) ====== */}
            <div className="hidden md:flex flex-row gap-8 max-w-[1280px] w-full mx-auto px-6 pt-[120px] pb-16">
                {/* LEFT COLUMN: Flipkart Sidebar (w-80) */}
                <div className="w-80 shrink-0 flex flex-col space-y-4">
                    {/* 1. User Header Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            {imagePreview ? (
                                <img src={imagePreview} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20" alt="avatar" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center text-primary font-black text-xl">
                                    {(profileFormData.name || 'U').charAt(0)}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-[#e11955] text-white p-1 rounded-full shadow-md">
                                <Camera size={10} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block">Hello,</span>
                            <span className="text-sm font-black text-gray-800 tracking-tight truncate block">{profileInfo?.name || userInfo?.name || 'Customer'}</span>
                        </div>
                        <button onClick={() => { dispatch(get_profile()); dispatch(get_supplier_status()); toast.success("Refreshed"); }} className="p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" title="Refresh">
                            <RefreshCw size={16} className={`text-gray-400 hover:text-primary ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* 2. Supplier Access Banner */}
                    <div className="overflow-hidden rounded-2xl shadow-sm">
                        {renderSupplierBanner()}
                    </div>

                    {/* 3. Flipkart Menu Sidebar Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-2 overflow-hidden">
                        <button onClick={() => setActiveDesktopTab('orders')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'orders' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <div className="flex items-center space-x-3">
                                <Package size={20} className={activeDesktopTab === 'orders' ? 'text-blue-600' : 'text-indigo-600'} />
                                <span className="text-xs font-black uppercase tracking-wider text-gray-800">My Orders</span>
                            </div>
                            <ChevronRight size={16} className={activeDesktopTab === 'orders' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>

                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-50">
                            <span className="text-[10px] font-black tracking-[3px] text-gray-400 uppercase flex items-center gap-2">
                                <User size={12} /> Account Settings
                            </span>
                        </div>
                        <button onClick={() => setActiveDesktopTab('profile')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'profile' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Profile Information</span>
                            <ChevronRight size={16} className={activeDesktopTab === 'profile' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>
                        <button onClick={() => setActiveDesktopTab('addresses')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'addresses' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Manage Addresses</span>
                            <ChevronRight size={16} className={activeDesktopTab === 'addresses' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>
                        <button onClick={() => setActiveDesktopTab('language')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'language' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Language Settings</span>
                            <ChevronRight size={16} className={activeDesktopTab === 'language' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>

                        <div className="px-4 py-3 bg-gray-50/50 border-y border-gray-50">
                            <span className="text-[10px] font-black tracking-[3px] text-gray-400 uppercase flex items-center gap-2">
                                <Building size={12} /> Payments & Payouts
                            </span>
                        </div>
                        <button onClick={() => setActiveDesktopTab('bank')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'bank' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Bank & UPI Details</span>
                            <ChevronRight size={16} className={activeDesktopTab === 'bank' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>
                        <button onClick={() => setActiveDesktopTab('refer')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'refer' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Refer & Earn</span>
                            <div className="bg-orange-100 px-2 py-0.5 rounded text-[10px] font-black text-orange-600">₹100</div>
                        </button>

                        <div className="px-4 py-3 bg-gray-50/50 border-y border-gray-50">
                            <span className="text-[10px] font-black tracking-[3px] text-gray-400 uppercase flex items-center gap-2">
                                <Settings size={12} /> App Settings
                            </span>
                        </div>
                        <button onClick={() => setActiveDesktopTab('notifications')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'notifications' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Notification Settings</span>
                            <ChevronRight size={16} className={activeDesktopTab === 'notifications' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>
                        <button onClick={() => setActiveDesktopTab('privacy')} className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${activeDesktopTab === 'privacy' ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 font-black' : 'text-gray-700 hover:bg-gray-50 font-bold'}`}>
                            <span className="text-xs tracking-tight pl-2">Security & Privacy</span>
                            <ChevronRight size={16} className={activeDesktopTab === 'privacy' ? 'text-blue-600' : 'text-gray-400'} />
                        </button>

                        <div className="p-4 border-t border-gray-100 flex flex-col space-y-2 mt-2">
                            <button onClick={() => setShowSupportModal(true)} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-teal-50 text-teal-700 font-bold rounded-xl text-xs hover:bg-teal-100 transition-colors cursor-pointer">
                                <Headphones size={14} /> <span>24x7 Support Care</span>
                            </button>
                            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs hover:bg-rose-100 transition-colors cursor-pointer">
                                <LogOut size={14} /> <span>Logout Account</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Content View */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col min-h-[600px]">
                    {activeDesktopTab === 'orders' && <Orders desktopEmbedded={true} />}
                    {activeDesktopTab === 'addresses' && <Addresses desktopEmbedded={true} />}
                    {activeDesktopTab === 'language' && <Language desktopEmbedded={true} />}
                    
                    {activeDesktopTab === 'refer' && (
                        <div>
                            <div className="pb-6 mb-8 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Refer & Earn Rewards</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Invite friends and earn wallet cash on their first successful delivery</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden max-w-2xl">
                                <div className="absolute -right-10 -bottom-10 opacity-20"><Gift size={240} /></div>
                                <div className="relative z-10 max-w-md space-y-6">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Special Reward</span>
                                    <h3 className="text-3xl font-black tracking-tight leading-tight">Get ₹100 instantly for every friend you refer!</h3>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">Your friend gets ₹50 off on their first order above ₹500. Once their order is delivered, ₹100 is automatically credited to your Jeenora Wallet.</p>
                                    <div className="pt-2 flex items-center gap-4">
                                        <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-2xl font-mono font-black text-lg tracking-wider">JEENA100</div>
                                        <button onClick={() => { navigator.clipboard.writeText('JEENA100'); toast.success('Referral code copied!'); }} className="bg-white text-orange-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:bg-white/90 active:scale-95 transition-all cursor-pointer">Copy Code</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDesktopTab === 'profile' && (
                        <div>
                            <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Personal Information</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Manage your identity, contact info, and delivery coordinates</p>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all cursor-pointer">
                                    <Camera size={14} /> <span>Update Photo</span>
                                </button>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-2xl">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                name="name" value={profileFormData.name} onChange={handleProfileInput}
                                                placeholder="Full Name"
                                                className="w-full bg-gray-50/50 border border-gray-200 p-4 pl-12 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input 
                                                name="phone" value={profileFormData.phone} onChange={handleProfileInput}
                                                placeholder="Phone Number"
                                                className="w-full bg-gray-50/50 border border-gray-200 p-4 pl-12 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            value={profileInfo?.email || userInfo?.email || ''} disabled
                                            className="w-full bg-gray-100 border border-gray-200 p-4 pl-12 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 ml-1 italic">Email address cannot be changed once verified.</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-1">Delivery Coordinates</label>
                                        <button type="button" onClick={detectLocation} disabled={isDetecting} className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors cursor-pointer">
                                            {isDetecting ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                                            <span>{isDetecting ? 'Detecting...' : 'Auto Detect PIN'}</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">Pincode</label>
                                            <input name="pincode" value={profileFormData.pincode} onChange={handleProfileInput} placeholder="600001" className="w-full bg-gray-50/50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">City</label>
                                            <input name="city" value={profileFormData.city} onChange={handleProfileInput} placeholder="Chennai" className="w-full bg-gray-50/50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 ml-1 block mb-1">State</label>
                                            <input name="state" value={profileFormData.state} onChange={handleProfileInput} placeholder="Tamil Nadu" className="w-full bg-gray-50/50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" disabled={loading} className="w-64 bg-[#e11955] text-white font-black py-4 rounded-xl shadow-lg shadow-rose-100 uppercase tracking-widest text-xs flex items-center justify-center space-x-3 active:scale-95 transition-all hover:bg-rose-600 disabled:opacity-70 cursor-pointer">
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeDesktopTab === 'bank' && (
                        <div>
                            <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Bank & UPI Details</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Manage verified bank accounts for seamless refunds and partner payouts</p>
                                </div>
                                {bankForm.isVerified && !isEditingBank && (
                                    <button onClick={() => { setIsEditingBank(true); setBankForm(prev => ({ ...prev, isVerified: false })); setIsIFSCVerified(false); }} className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-all cursor-pointer">
                                        <Settings size={14} /> <span>Edit Bank Info</span>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block ml-1">Account Holder Name</label>
                                    <input type="text" value={bankForm.accountHolderName} onChange={(e) => setBankForm(prev => ({ ...prev, accountHolderName: e.target.value }))} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:bg-white'}`} placeholder="As per official bank records" />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block ml-1">IFSC Code</label>
                                        <div className="relative">
                                            <input type="text" value={bankForm.ifscCode} onChange={(e) => { setBankForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase(), isVerified: false })); setIsIFSCVerified(false); }} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none uppercase transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:bg-white'}`} placeholder="SBIN0012345" />
                                            {isIFSCVerified && <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button onClick={handleVerifyIFSC} disabled={isVerifyingBank || isIFSCVerified} className="w-full h-14 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer">
                                            <span>{isVerifyingBank ? "..." : isIFSCVerified ? "Verified" : "Verify IFSC"}</span>
                                        </button>
                                    </div>
                                </div>

                                {(bankForm.bankName || bankForm.branchName) && (
                                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 flex items-center space-x-3">
                                        <FaUniversity className="text-emerald-600 size-5" />
                                        <div>
                                            <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{bankForm.bankName}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase">{bankForm.branchName}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block ml-1">Account Number</label>
                                        <input type="password" value={bankForm.accountNumber} onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value, isVerified: false }))} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:bg-white'}`} placeholder="Enter account number" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block ml-1">Confirm Account Number</label>
                                        <input type="text" value={bankForm.confirmAccountNumber} onChange={(e) => setBankForm(prev => ({ ...prev, confirmAccountNumber: e.target.value }))} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:bg-white'}`} placeholder="Re-enter account number" />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button onClick={handleSaveBankDetails} disabled={isVerifyingBank || !isIFSCVerified || !bankForm.accountNumber || bankForm.accountNumber !== bankForm.confirmAccountNumber || (bankForm.isVerified && !isEditingBank)} className="w-64 bg-emerald-600 py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-emerald-700 transition-colors cursor-pointer">
                                        {isVerifyingBank && <Loader2 className="animate-spin size-4" />}
                                        <span>{(bankForm.isVerified && !isEditingBank) ? "Account Verified" : "Save & Verify Account"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDesktopTab === 'notifications' && (
                        <div>
                            <div className="pb-6 mb-8 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Notification Preferences</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Manage which alerts and marketing communications you receive</p>
                            </div>

                            <div className="space-y-4 max-w-2xl">
                                {[
                                    { id: 'orderUpdates', label: 'Order Updates', desc: 'Real-time tracking notifications and delivery status', state: backendNotificationSettings?.orderUpdates },
                                    { id: 'whatsappNotifications', label: 'WhatsApp Alerts', desc: 'Instant order confirmations directly on your WhatsApp', state: backendNotificationSettings?.whatsappNotifications },
                                    { id: 'emailNotifications', label: 'Email Notifications', desc: 'Invoices, tracking links, and order receipts via Email', state: backendNotificationSettings?.emailNotifications },
                                    { id: 'promotions', label: 'Promotions & Offers', desc: 'Exclusive discount codes and flash sale alerts', state: backendNotificationSettings?.promotions },
                                    { id: 'pushNotifications', label: 'Push Notifications', desc: 'App notifications for price drops and restocks', state: backendNotificationSettings?.pushNotifications },
                                ].map(item => (
                                    <div key={item.id} className="bg-gray-50/80 rounded-2xl p-5 flex items-center justify-between border border-gray-100/50 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleToggleNotification(item.id)}>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">{item.label}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                        </div>
                                        <div className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${item.state ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                            <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeDesktopTab === 'privacy' && (
                        <div>
                            <div className="pb-6 mb-8 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Security & Privacy</h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">Control your public visibility, data preferences, and account lifecycle</p>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/50">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4">Profile Visibility</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setPrivacySettings(s => ({ ...s, profileVisibility: 'public' }))} className={`py-3.5 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer ${privacySettings.profileVisibility === 'public' ? 'bg-[#e11955] border-[#e11955] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                            <Eye size={16} /> <span>Public View</span>
                                        </button>
                                        <button onClick={() => setPrivacySettings(s => ({ ...s, profileVisibility: 'private' }))} className={`py-3.5 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer ${privacySettings.profileVisibility === 'private' ? 'bg-[#e11955] border-[#e11955] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                            <EyeOff size={16} /> <span>Private View</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPrivacySettings(s => ({ ...s, dataSharing: !s.dataSharing }))}>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">Analytics Data Sharing</h4>
                                        <p className="text-xs text-gray-500 mt-1">Help us improve your personalized shopping recommendations</p>
                                    </div>
                                    <div className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${privacySettings.dataSharing ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                                        <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-gray-200">
                                    <span className="text-[10px] font-black tracking-[2px] text-red-500 uppercase block mb-4">Danger Zone</span>
                                    <div className="bg-red-50/80 rounded-2xl p-5 border border-red-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-black text-red-600 uppercase tracking-tight">Delete Your Account</h4>
                                            <p className="text-xs text-red-400 mt-0.5">Permanently erase your identity, order records, and partner data</p>
                                        </div>
                                        <button onClick={() => setShowDeleteModal(true)} className="px-5 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-red-700 transition-colors cursor-pointer">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* <input type="file" /> attached for desktop upload */}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

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

            {/* Bank Details Modal (For Mobile Triggers) */}
            <BottomModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Bank & UPI Details">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-500 text-xs font-medium">Bank details are used for instant refunds and secure payouts.</p>
                        {bankForm.isVerified && !isEditingBank && (
                            <button onClick={() => { setIsEditingBank(true); setBankForm(prev => ({ ...prev, isVerified: false })); setIsIFSCVerified(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-indigo-100 active:scale-95 transition-all">
                                <Settings size={12} /> Edit
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Account Holder Name</label>
                            <input type="text" value={bankForm.accountHolderName} onChange={(e) => setBankForm(prev => ({ ...prev, accountHolderName: e.target.value }))} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-200 focus:border-emerald-300'}`} placeholder="As per bank records" />
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">IFSC Code</label>
                                <div className="relative">
                                    <input type="text" value={bankForm.ifscCode} onChange={(e) => { setBankForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase(), isVerified: false })); setIsIFSCVerified(false); }} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all uppercase ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-200 focus:border-emerald-300'}`} placeholder="SBIN0012345" />
                                    {isIFSCVerified && <FaCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                                </div>
                            </div>
                            <div className="pt-6">
                                <button onClick={handleVerifyIFSC} disabled={isVerifyingBank || isIFSCVerified} className="px-4 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all">
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
                            <input type="password" value={bankForm.accountNumber} onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value, isVerified: false }))} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-200 focus:border-emerald-300'}`} placeholder="Enter account number" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block">Confirm Account Number</label>
                            <input type="text" value={bankForm.confirmAccountNumber} onChange={(e) => setBankForm(prev => ({ ...prev, confirmAccountNumber: e.target.value }))} disabled={bankForm.isVerified && !isEditingBank} className={`w-full border rounded-xl p-4 font-bold text-gray-800 outline-none transition-all ${bankForm.isVerified && !isEditingBank ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-gray-50 border-gray-200 focus:border-emerald-300'}`} placeholder="Re-enter account number" />
                        </div>
                    </div>

                    <button onClick={handleSaveBankDetails} disabled={isVerifyingBank || !isIFSCVerified || !bankForm.accountNumber || bankForm.accountNumber !== bankForm.confirmAccountNumber || (bankForm.isVerified && !isEditingBank)} className="w-full bg-emerald-600 py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 flex justify-center disabled:opacity-50 hover:bg-emerald-700 transition-colors">
                        {isVerifyingBank ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (bankForm.isVerified && !isEditingBank) ? "Account Verified" : "Save & Verify Account"}
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
                <button onClick={() => { setSupportSubmitting(true); setTimeout(() => { setSupportSubmitting(false); setShowSupportModal(false); toast.success("Ticket Submitted"); }, 1000); }} disabled={supportSubmitting} className="w-full bg-[#e11955] py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-100 flex justify-center disabled:opacity-50 hover:bg-rose-600 transition-colors">
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

                <div className="mt-10 pt-6 border-t border-gray-100">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Danger Zone</p>
                    <button onClick={() => { setShowPrivacyModal(false); setShowDeleteModal(true); }} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 group active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm group-hover:scale-110 transition-transform"><ShieldAlert size={18} /></div>
                            <div className="text-left">
                                <h4 className="text-sm font-black text-red-600 uppercase tracking-tighter">Delete Account</h4>
                                <p className="text-[10px] text-red-400 font-bold uppercase">This action is permanent</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-red-300" />
                    </button>
                </div>
            </BottomModal>

            {/* Delete Account Confirmation Modal */}
            <BottomModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100/50">
                        <ShieldAlert size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Are you absolutely sure?</h2>
                    <p className="text-gray-500 text-xs mb-8 font-medium leading-relaxed">
                        To protect your account, please enter your password to confirm deletion. Your data will be hidden and your sessions will be revoked.
                    </p>
                    
                    <form onSubmit={handleDeleteAccount} className="w-full space-y-4">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest block ml-1">Your Password</label>
                            <input required type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-red-300" placeholder="••••••••" />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={isDeleting} className="flex-[2] bg-red-600 py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-red-100 flex justify-center disabled:opacity-50">
                                {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Delete Forever"}
                            </button>
                        </div>
                    </form>
                </div>
            </BottomModal>

        </div>
    );
};

export default Profile;
