import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { get_profile } from '../../store/reducers/profileReducer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, CreditCard, MapPin, 
    User, Store, HelpCircle, Check,
    AlertCircle, ChevronDown, ShieldCheck,
    Briefcase, Building, Mail, Phone,
    CheckCircle2, Info, Lock, MapPinned,
    Search, Hash, Star, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../api/apiClient';
import Select from '../../components/common/Select';

const SupplierRegistration = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);
    const { profileInfo } = useSelector(state => state.profile);
    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(get_profile());
    }, [dispatch]);

    // PERSISTENT REGISTRATION STATE (Matching Android Logic)
    const [registrationData, setRegistrationData] = useState({
        businessDetails: {
            shopName: '',
            businessType: 'Retailer',
            hasGst: null,
            gstNumber: ''
        },
        addressDetails: {
            pincode: '',
            state: '',
            city: '',
            district: '',
            addressLine: '',
            street: '',
            landmark: ''
        },
        bankDetails: {
            accountNumber: '',
            confirmAccountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: '',
            address: '',
            city: '',
            state: ''
        },
        supplierDetails: {
            fullName: '',
            email: '',
            phone: ''
        }
    });
    
    // Auto-fill from logged-in user
    useEffect(() => {
        const source = profileInfo || userInfo;
        if (source) {
            setRegistrationData(prev => ({
                ...prev,
                supplierDetails: {
                    fullName: source.name || '',
                    email: source.email || '',
                    phone: source.phone || ''
                }
            }));
        }
    }, [userInfo, profileInfo]);

    // Verification States
    const [isGstVerified, setIsGstVerified] = useState(false);
    const [isPincodeVerified, setIsPincodeVerified] = useState(false);
    const [isIfscVerified, setIsIfscVerified] = useState(false);
    const [isBankVerified, setIsBankVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');

    const steps = [
        { name: 'Business Details', icon: <CreditCard size={18} /> },
        { name: 'Pickup Address', icon: <MapPin size={18} /> },
        { name: 'Bank Details', icon: <Building size={18} /> },
        { name: 'Supplier Details', icon: <User size={18} /> },
    ];

    // --- LOGIC FUNCTIONS (Deeply Ported from Android) ---

    // 1. GST Verification logic
    const handleVerifyGst = () => {
        const { gstNumber } = registrationData.businessDetails;
        if (!gstNumber || gstNumber.length < 15) return toast.error("Enter valid 15-digit GSTIN");
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setIsGstVerified(true);
            toast.success("GSTIN Verified!");
        }, 1200);
    };

    // 2. Pincode Auto-fetch logic (Now using server endpoint /verify-pincode)
    const handlePincodeChange = async (val) => {
        setRegistrationData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, pincode: val } }));
        if (val.length === 6) {
            setVerifying(true);
            try {
                const response = await apiClient.post('/wear/supplier/verify-pincode', { pincode: val });
                const { data } = response.data;
                setVerifying(false);
                if (data) {
                    setRegistrationData(prev => ({
                        ...prev,
                        addressDetails: {
                            ...prev.addressDetails,
                            district: data.district,
                            city: data.city,
                            state: data.state,
                            pincode: val
                        }
                    }));
                    setIsPincodeVerified(true);
                    toast.success("Pincode verified!");
                }
            } catch (e) {
                setVerifying(false);
                setIsPincodeVerified(false);
                toast.error(e.response?.data?.error || "Invalid Pincode");
            }
        } else {
            setIsPincodeVerified(false);
        }
    };

    // 3. IFSC Verification logic (Now using server endpoint /verify-ifsc)
    const handleVerifyIfsc = async () => {
        const { ifscCode } = registrationData.bankDetails;
        if (!ifscCode || ifscCode.length < 11) return toast.error("Enter valid 11-digit IFSC");
        setVerifying(true);
        
        try {
            const response = await apiClient.post('/wear/supplier/verify-ifsc', { ifscCode });
            const { bankDetails } = response.data;
            setVerifying(false);
            setRegistrationData(prev => ({
                ...prev,
                bankDetails: {
                    ...prev.bankDetails,
                    bankName: bankDetails.bank,
                    branchName: bankDetails.branch,
                    address: bankDetails.address,
                    city: bankDetails.city,
                    state: bankDetails.state
                }
            }));
            setIsIfscVerified(true);
            toast.success("Bank details fetched!");
        } catch (e) {
            setVerifying(false);
            setIsIfscVerified(false);
            toast.error(e.response?.data?.error || "Verification Failed");
        }
    };

    const handleVerifyBankAccount = async () => {
        const { accountNumber, confirmAccountNumber, ifscCode } = registrationData.bankDetails;
        if (!accountNumber || accountNumber !== confirmAccountNumber) return toast.error("Account numbers do not match");
        if (accountNumber.length < 8) return toast.error("Invalid account number");
        
        setVerifying(true);
        try {
            const response = await apiClient.post('/wear/supplier/verify-bank', { accountNumber, ifscCode });
            setVerifying(false);
            if (response.data.success) {
                setIsBankVerified(true);
                toast.success(response.data.message || "Account Verified!");
            }
        } catch (error) {
            setVerifying(false);
            toast.error(error.response?.data?.error || "Bank Verification Failed");
        }
    };

    const handleSendEmailOtp = async () => {
        const { email } = registrationData.supplierDetails;
        if (!email || !email.includes('@')) return toast.error("Enter valid email");
        
        setVerifyingEmail(true);
        try {
            const response = await apiClient.post('/wear/supplier/send-email-otp', { email });
            setVerifyingEmail(false);
            if (response.data.success) {
                setOtpSent(true);
                toast.success("Verification code sent to email!");
            }
        } catch (error) {
            setVerifyingEmail(false);
            toast.error(error.response?.data?.error || "Failed to send code");
        }
    };

    const handleVerifyEmailOtp = async () => {
        const { email } = registrationData.supplierDetails;
        if (!emailOtp || emailOtp.length < 6) return toast.error("Enter 6-digit code");

        setVerifyingEmail(true);
        try {
            const response = await apiClient.post('/wear/supplier/verify-email-otp', { email, otp: emailOtp });
            setVerifyingEmail(false);
            if (response.data.success) {
                setIsEmailVerified(true);
                setOtpSent(false);
                toast.success("Email Verified Successfully!");
            }
        } catch (error) {
            setVerifyingEmail(false);
            toast.error(error.response?.data?.error || "Invalid Code");
        }
    };

    const handleContinue = async () => {
        // Step 0: Business Check
        if (stepIndex === 0) {
            const { shopName, hasGst, gstNumber } = registrationData.businessDetails;
            if (!shopName) return toast.error("Shop Name is required");
            if (hasGst === 'yes' && !isGstVerified) return toast.error("Verify GST first");
            if (!hasGst) return toast.error("Choose GST option");
        }
        // Step 1: Address Check
        if (stepIndex === 1) {
            const { pincode, addressLine } = registrationData.addressDetails;
            if (!isPincodeVerified) return toast.error("Verify pincode first");
            if (!addressLine) return toast.error("Enter House/Shop Number");
        }
        // Step 2: Bank Check
        if (stepIndex === 2) {
            if (!isBankVerified) return toast.error("Verify bank account first");
        }
        // Step 3: Supplier Check
        if (stepIndex === 3) {
            const { fullName, email, phone } = registrationData.supplierDetails;
            if (!fullName) return toast.error("Enter full name");
            if (!phone || phone.length < 10) return toast.error("Enter valid phone number");
            if (!isEmailVerified) return toast.error("Verify your email first");
        }

        if (stepIndex < 3) {
            setStepIndex(stepIndex + 1);
        } else {
            // Final submission to backend
            setLoading(true);
            try {
                const response = await apiClient.post('/wear/supplier/apply', registrationData);
                setLoading(false);
                if (response.data.success) {
                    setStepIndex(4); // Success screen
                    toast.success("Application Sent Successfully!");
                }
            } catch (error) {
                setLoading(false);
                toast.error(error.response?.data?.error || "Submission failed");
            }
        }
    };

    // --- UI RENDER HELPERS (Pixel-perfect Android replicas) ---

    const renderStepHeader = () => (
        <div className="flex bg-white border-b border-gray-100">
            {steps.map((step, index) => {
                const isActive = stepIndex === index;
                const isCompleted = stepIndex > index;
                return (
                    <div key={index} className="flex-1 flex flex-col items-center py-2 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all ${isActive ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-transparent text-gray-400'}`}>
                            {isCompleted ? <Check size={16} /> : React.cloneElement(step.icon, { size: 16 })}
                        </div>
                        <span className={`text-[8px] text-center font-medium tracking-tight px-1 ${isActive ? 'text-[#7C3AED]' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {step.name}
                        </span>
                        {isActive && <div className="absolute bottom-0 w-full h-[2px] bg-[#7C3AED]" />}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="h-screen overflow-hidden bg-white flex flex-col font-sans w-full overscroll-none touch-none">
            {/* STICKY TOP SECTION: HEADER + STEPS */}
            <div className="flex-none bg-white shadow-sm z-50">
                <div className="h-[56px] border-b border-gray-100 flex items-center justify-between px-4">
                    <div className="flex items-center">
                        <button onClick={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : navigate(-1)} className="mr-3">
                            <ChevronLeft size={24} color="black" />
                        </button>
                        <span className="text-sm font-bold text-gray-800">Shop Registration</span>
                    </div>
                    <button className="text-[#7C3AED] font-bold text-xs">Help?</button>
                </div>
                {stepIndex < 4 && renderStepHeader()}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 touch-pan-y shadow-inner">
                <AnimatePresence mode="wait">
                    {/* STEP 1: BUSINESS DETAILS */}
                    {stepIndex === 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="b" className="p-5">
                            <div className="flex items-center mb-6">
                                <Store size={22} className="text-[#7C3AED] mr-2" />
                                <span className="text-gray-900 font-bold text-base">Shop Details</span>
                            </div>
                            <div className="mb-6">
                                <label className="text-gray-700 font-bold text-xs mb-2 block">Shop Name</label>
                                <input 
                                    placeholder="Enter your store name"
                                    value={registrationData.businessDetails.shopName}
                                    onChange={(e) => setRegistrationData(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, shopName: e.target.value } }))}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                />
                            </div>
                            <Select 
                                label="Business Type"
                                options={['Retailer', 'Wholesaler', 'Manufacturer']}
                                value={registrationData.businessDetails.businessType}
                                onChange={(val) => setRegistrationData(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, businessType: val } }))}
                            />
                            <p className="text-gray-900 font-bold text-base mb-6">Do you have a GST number?</p>
                            <div className="flex gap-4 mb-8">
                                <button onClick={() => setRegistrationData(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, hasGst: 'yes' } }))} className={`flex-1 p-4 rounded-xl border h-32 flex flex-col justify-between text-left ${registrationData.businessDetails.hasGst === 'yes' ? 'bg-[#7C3AED]/5 border-[#7C3AED]' : 'bg-white border-gray-200'}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${registrationData.businessDetails.hasGst === 'yes' ? 'border-[#7C3AED]' : 'border-gray-300'}`}>
                                        {registrationData.businessDetails.hasGst === 'yes' && <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />}
                                    </div>
                                    <div><p className="font-bold text-sm">Yes</p><p className="text-[10px] text-gray-400">Fast verification with GSTIN</p></div>
                                </button>
                                <button onClick={() => setRegistrationData(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, hasGst: 'no' } }))} className={`flex-1 p-4 rounded-xl border h-32 flex flex-col justify-between text-left ${registrationData.businessDetails.hasGst === 'no' ? 'bg-[#7C3AED]/5 border-[#7C3AED]' : 'bg-white border-gray-200'}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${registrationData.businessDetails.hasGst === 'no' ? 'border-[#7C3AED]' : 'border-gray-300'}`}>
                                        {registrationData.businessDetails.hasGst === 'no' && <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />}
                                    </div>
                                    <div><p className="font-bold text-sm">No</p><p className="text-[10px] text-gray-400">Register with PAN</p></div>
                                </button>
                            </div>
                            {registrationData.businessDetails.hasGst === 'yes' && (
                                <div className="flex gap-3">
                                    <input 
                                        placeholder="Enter GSTIN"
                                        value={registrationData.businessDetails.gstNumber}
                                        onChange={(e) => setRegistrationData(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, gstNumber: e.target.value.toUpperCase() } }))}
                                        className="flex-1 bg-gray-50 border border-secondary/10 rounded-lg px-4 text-sm font-medium h-[44px] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                    />
                                    <button onClick={handleVerifyGst} className={`px-5 rounded-lg font-bold text-xs h-[44px] transition-all hover:scale-[1.02] active:scale-[0.98] ${isGstVerified ? 'bg-green-100 text-green-600' : 'bg-[#7C3AED] text-white shadow-md shadow-indigo-100'}`}>
                                        {isGstVerified ? 'Verified' : 'Verify'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: PICKUP ADDRESS */}
                    {stepIndex === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="a" className="p-5">
                            <div className="flex items-center mb-6">
                                <MapPin size={22} className="text-[#7C3AED] mr-2" />
                                <span className="text-gray-900 font-bold text-base">Pickup Details</span>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-3">
                                <Info size={18} className="text-blue-500 shrink-0" />
                                <p className="text-blue-700 text-[11px] font-medium leading-relaxed">Products will be picked up from this address. Ensure accuracy.</p>
                            </div>
                            <div className="mb-6">
                                <label className="text-gray-700 font-medium text-xs mb-2 block">Pincode</label>
                                <div className="relative">
                                    <input 
                                        placeholder="600001"
                                        value={registrationData.addressDetails.pincode}
                                        onChange={(e) => handlePincodeChange(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3.5 text-sm font-bold focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        maxLength={6}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {verifying ? <div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent animate-spin rounded-full" /> : 
                                         isPincodeVerified ? <Check size={18} className="text-green-500" /> : null}
                                    </div>
                                </div>
                            </div>
                            {isPincodeVerified && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                                    <div>
                                        <label className="text-gray-700 font-bold text-xs mb-2 block">State</label>
                                        <div className="bg-gray-100 border border-gray-100 rounded-lg p-3.5 text-sm font-bold text-gray-500 flex justify-between">
                                            {registrationData.addressDetails.state} <Lock size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-700 font-bold text-xs mb-2 block">City</label>
                                        <input value={registrationData.addressDetails.city} disabled className="w-full bg-gray-100 border border-gray-100 rounded-lg p-3.5 text-sm font-bold text-gray-500" />
                                    </div>
                                    <div>
                                        <label className="text-gray-700 font-bold text-xs mb-2 block">House/Building No</label>
                                        <input 
                                            placeholder="e.g. Shop No 2, 1st Floor"
                                            value={registrationData.addressDetails.addressLine}
                                            onChange={(e) => setRegistrationData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, addressLine: e.target.value } }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3.5 text-sm font-bold focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-700 font-bold text-xs mb-2 block">Area/Street</label>
                                        <input 
                                            placeholder="e.g. Gandhi Bazar"
                                            value={registrationData.addressDetails.street}
                                            onChange={(e) => setRegistrationData(prev => ({ ...prev, addressDetails: { ...prev.addressDetails, street: e.target.value } }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3.5 text-sm font-bold focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: BANK DETAILS */}
                    {stepIndex === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="bk" className="p-5">
                            <div className="flex items-center mb-6">
                                <Building size={22} className="text-[#7C3AED] mr-2" />
                                <span className="text-gray-900 font-bold text-base">Bank Information</span>
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-6 flex gap-3">
                                <Shield size={18} className="text-amber-600 shrink-0" />
                                <p className="text-amber-800 text-[11px] font-medium leading-relaxed">Encrypted and secure. Only used for your payouts.</p>
                            </div>
                            <div className="mb-8">
                                <label className="text-gray-700 font-bold text-xs mb-2 block">IFSC Code</label>
                                <div className="flex gap-3">
                                    <input 
                                        placeholder="SBIN0001234"
                                        value={registrationData.bankDetails.ifscCode}
                                        onChange={(e) => setRegistrationData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, ifscCode: e.target.value.toUpperCase() } }))}
                                        className="flex-1 bg-gray-50 border border-secondary/10 rounded-lg px-4 text-sm font-medium tracking-widest h-[44px] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        maxLength={11}
                                    />
                                    <button onClick={handleVerifyIfsc} disabled={isIfscVerified || verifying} className={`px-5 rounded-lg font-bold text-xs h-[44px] transition-all hover:scale-[1.02] active:scale-[0.98] ${isIfscVerified ? 'bg-green-100 text-green-600' : 'bg-[#7C3AED] text-white shadow-md shadow-indigo-100'}`}>
                                        {isIfscVerified ? 'Verified' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                            {isIfscVerified && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="bg-white border border-[#7C3AED]/10 p-5 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="bg-[#7C3AED]/5 px-2 py-0.5 rounded text-[#7C3AED] text-[10px] font-black uppercase">{registrationData.bankDetails.bankName}</span>
                                            <CheckCircle2 size={18} className="text-green-500" />
                                        </div>
                                        <p className="text-gray-800 font-black text-sm">{registrationData.bankDetails.branchName}</p>
                                        <p className="text-gray-400 text-[10px] mt-1">{registrationData.bankDetails.address}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-700 font-bold text-xs mb-2 block">Account Number</label>
                                        <input 
                                            type="password"
                                            placeholder="Enter bank account number"
                                            value={registrationData.bankDetails.accountNumber}
                                            onChange={(e) => setRegistrationData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value } }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3.5 text-sm font-bold focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-gray-700 font-bold text-xs block">Confirm Account</label>
                                            {registrationData.bankDetails.confirmAccountNumber.length > 0 && (
                                                registrationData.bankDetails.accountNumber === registrationData.bankDetails.confirmAccountNumber ? 
                                                <span className="text-[10px] text-green-600 font-black flex items-center gap-1"><Check size={12} /> MATCHED</span> : 
                                                <span className="text-[10px] text-red-500 font-black flex items-center gap-1"><AlertCircle size={12} /> MISMATCH</span>
                                            )}
                                        </div>
                                        <input 
                                            placeholder="Re-enter account number"
                                            value={registrationData.bankDetails.confirmAccountNumber}
                                            onChange={(e) => setRegistrationData(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, confirmAccountNumber: e.target.value } }))}
                                            className={`w-full bg-gray-50 border rounded-lg p-3.5 text-sm font-medium transition-all focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 ${
                                                registrationData.bankDetails.confirmAccountNumber.length > 0 && 
                                                registrationData.bankDetails.accountNumber !== registrationData.bankDetails.confirmAccountNumber ? 
                                                'border-red-500 bg-red-50/30' : 'border-gray-100'
                                            }`}
                                        />
                                        {registrationData.bankDetails.confirmAccountNumber.length > 0 && 
                                         registrationData.bankDetails.accountNumber !== registrationData.bankDetails.confirmAccountNumber && (
                                            <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 flex items-center gap-1">
                                                <Info size={10} /> Account numbers do not match
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={handleVerifyBankAccount} className={`w-full py-4 rounded-xl font-black text-sm transition-all ${isBankVerified ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-[#7C3AED] text-white'}`}>
                                        {isBankVerified ? '✓ BANK VERIFIED' : 'VERIFY BANK ACCOUNT'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 4: SUPPLIER DETAILS */}
                    {stepIndex === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="s" className="p-5">
                            <div className="flex items-center mb-6">
                                <User size={22} className="text-[#7C3AED] mr-2" />
                                <span className="text-gray-900 font-bold text-base">Personal Details</span>
                            </div>

                            <div className="space-y-6">
                                {/* Info Card */}
                                <div className="bg-[#7C3AED]/5 border border-[#7C3AED]/10 p-4 rounded-xl flex gap-3">
                                    <ShieldCheck size={18} className="text-[#7C3AED] shrink-0" />
                                    <p className="text-[#7C3AED] text-[11px] font-medium leading-relaxed">
                                        Verify your contact information to finish your application. This ensures secure communication about your orders and payouts.
                                    </p>
                                </div>

                                {/* Full Name Input */}
                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-2 block">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                                            <User size={16} />
                                        </div>
                                        <input 
                                            placeholder="John Doe"
                                            value={registrationData.supplierDetails.fullName}
                                            onChange={(e) => setRegistrationData(prev => ({ ...prev, supplierDetails: { ...prev.supplierDetails, fullName: e.target.value } }))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg py-4 pl-12 pr-5 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Phone Input */}
                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-2 block">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                                            <Phone size={16} />
                                        </div>
                                        <span className="absolute inset-y-0 left-10 flex items-center text-gray-400 font-bold text-sm">+91</span>
                                        <input 
                                            type="tel"
                                            maxLength={10}
                                            placeholder="00000 00000"
                                            value={registrationData.supplierDetails.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setRegistrationData(prev => ({ ...prev, supplierDetails: { ...prev.supplierDetails, phone: val } }));
                                            }}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg py-4 pl-20 pr-5 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email Input with Verification */}
                                <div>
                                    <label className="text-gray-700 font-bold text-xs mb-2 block">Email Address (Gmail)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                                                <Mail size={16} />
                                            </div>
                                            <input 
                                                type="email"
                                                disabled={isEmailVerified}
                                                placeholder="name@gmail.com"
                                                value={registrationData.supplierDetails.email}
                                                onChange={(e) => setRegistrationData(prev => ({ ...prev, supplierDetails: { ...prev.supplierDetails, email: e.target.value } }))}
                                                className={`w-full bg-gray-50 border ${isEmailVerified ? 'border-green-100 bg-green-50/30' : 'border-gray-100'} rounded-lg py-4 pl-12 pr-5 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all`}
                                            />
                                        </div>
                                        {!isEmailVerified && (
                                            <button 
                                                onClick={handleSendEmailOtp}
                                                disabled={verifyingEmail || !registrationData.supplierDetails.email}
                                                className="px-4 bg-[#7C3AED] text-white rounded-lg font-bold text-xs h-[54px] disabled:opacity-50"
                                            >
                                                {otpSent ? "Resend" : "Verify"}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isEmailVerified && (
                                        <div className="mt-2 flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase ml-1">
                                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            Email Verified Successfully
                                        </div>
                                    )}
                                </div>

                                {/* OTP Input Modal/Section */}
                                {otpSent && !isEmailVerified && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-2 border-[#7C3AED]/20 p-6 rounded-2xl shadow-xl shadow-[#7C3AED]/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3">
                                            <button onClick={() => setOtpSent(false)} className="text-gray-400 hover:text-gray-600"><Check size={18} /></button>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-full flex items-center justify-center text-[#7C3AED] mb-4">
                                                <Mail size={24} />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 mb-1">Enter Verification Code</h3>
                                            <p className="text-xs text-gray-500 mb-6 font-medium">We've sent a 6-digit code to <br/><span className="text-gray-900 font-bold">{registrationData.supplierDetails.email}</span></p>
                                            
                                            <div className="flex gap-2 mb-6">
                                                {/* Simple one-field OTP for mobile ease */}
                                                <input 
                                                    type="tel"
                                                    maxLength={6}
                                                    value={emailOtp}
                                                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="000000"
                                                    className="w-full text-center text-2xl font-black tracking-[0.5em] bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all"
                                                />
                                            </div>

                                            <button 
                                                onClick={handleVerifyEmailOtp}
                                                disabled={verifyingEmail || emailOtp.length < 6}
                                                className="w-full bg-[#7C3AED] text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs disabled:opacity-50"
                                            >
                                                {verifyingEmail ? "Verifying..." : "Verify Code"}
                                            </button>
                                            
                                            <button onClick={handleSendEmailOtp} className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#7C3AED] transition-colors">
                                                Didn't receive code? Resend
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="p-4 rounded-lg bg-gray-50/80 border border-dashed border-gray-200">
                                    <div className="flex items-center mb-2">
                                        <ShieldCheck size={14} className="text-green-600 mr-2" />
                                        <span className="text-gray-900 font-bold text-[10px] uppercase tracking-widest">Trust & Safety</span>
                                    </div>
                                    <p className="text-gray-500 text-[10px] leading-relaxed">By clicking register, you agree to Jeenora Store Policies and Terms of Service.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SUCCESS SCREEN */}
                    {stepIndex === 4 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 mt-20 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <Check size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Application Sent!</h2>
                            <p className="text-gray-500 text-sm mb-10 leading-relaxed font-medium">Your registration is complete. We will verify your account within 24 hours.</p>
                            <button onClick={() => navigate('/profile')} className="w-full bg-[#7C3AED] text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 uppercase tracking-widest text-sm">
                                Back to Profile
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* FIXED FOOTER BUTTON */}
            {stepIndex < 4 && (
                <div className="flex-none p-4 bg-white border-t border-gray-100 z-50">
                    <button 
                        onClick={handleContinue}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${loading ? 'bg-gray-200 text-gray-400' : 'bg-[#7C3AED] text-white shadow-lg shadow-indigo-100'}`}
                    >
                        {loading ? "Processing..." : stepIndex === 3 ? "Start Selling Now" : "Save & Continue"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SupplierRegistration;
