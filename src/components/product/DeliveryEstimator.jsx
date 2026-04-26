import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../api/apiClient';

const DeliveryEstimator = ({ productId }) => {
    const [pincode, setPincode] = useState('');
    const [locationData, setLocationData] = useState(null);
    const [eddData, setEddData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Load initial pincode from localStorage or auto-detect
    useEffect(() => {
        const savedPincode = localStorage.getItem('user_pincode');
        if (savedPincode) {
            setPincode(savedPincode);
            fetchEDD(savedPincode);
        } else {
            // Auto-detect if no pincode saved
            detectLocation();
        }
    }, []);

    const fetchEDD = async (targetPincode) => {
        if (!targetPincode || targetPincode.length < 6) return;
        
        setIsLoading(true);
        try {
            const response = await apiClient.get('/wear/delivery/edd', {
                params: {
                    productId: productId,
                    deliveryPincode: targetPincode
                }
            });

            if (response.data.success) {
                setEddData(response.data);
                localStorage.setItem('user_pincode', targetPincode);
            }
        } catch (error) {
            console.error("EDD Fetch Error:", error);
            // Fallback handled by server, but we can show local error if needed
        } finally {
            setIsLoading(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await apiClient.get('/wear/delivery/pincode', {
                        params: { lat: latitude, lng: longitude }
                    });

                    if (response.data.success) {
                        const detectedPincode = response.data.pincode;
                        if (detectedPincode) {
                            setPincode(detectedPincode);
                            setLocationData(response.data);
                            fetchEDD(detectedPincode);
                        } else {
                            toast.error("Could not determine pincode from this location");
                        }
                    }
                } catch (error) {
                    toast.error("Failed to detect location details");
                } finally {
                    setIsDetecting(false);
                }
            },
            (error) => {
                setIsDetecting(false);
                toast.error("Location access denied or unavailable");
            }
        );
    };

    const handlePincodeChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setPincode(val);
        if (val.length === 6) {
            fetchEDD(val);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck size={16} className="text-[#e11955]" />
                        <span className="text-[12px] font-bold text-gray-800 uppercase tracking-tight">Delivery Details</span>
                    </div>
                    <button 
                        onClick={detectLocation}
                        disabled={isDetecting}
                        className="flex items-center gap-1.5 px-2.5 py-1.2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isDetecting ? (
                            <span className="w-3 h-3 border-2 border-[#e11955] border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <Navigation size={10} className="text-[#e11955]" />
                        )}
                        <span className="text-[9px] font-bold text-gray-600 uppercase">Detect</span>
                    </button>
                </div>
            </div>

            <div className="p-3 space-y-3">
                {/* Pincode Input */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <MapPin size={14} className="text-gray-400" />
                    </div>
                    <input 
                        type="text"
                        placeholder="Enter Pincode"
                        value={pincode}
                        onChange={handlePincodeChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e11955]/10 focus:border-[#e11955] transition-all"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="w-3.5 h-3.5 border-2 border-[#e11955] border-t-transparent rounded-full animate-spin block"></span>
                        </div>
                    )}
                </div>

                {/* Estimation Results */}
                {eddData ? (
                    <div className="bg-green-50/50 border border-green-100 p-3 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-full mt-0.5">
                                <CheckCircle2 size={16} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-gray-800">
                                    Expected Delivery by
                                </p>
                                <p className="text-[15px] font-black text-green-700 mt-0.5">
                                    {formatDate(eddData.edd)}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-white border border-green-200 rounded text-[9px] font-bold text-green-600 uppercase">
                                        FREE SHIPPING
                                    </span>
                                    {eddData.sellerCity && (
                                        <span className="text-[10px] font-medium text-gray-400 italic">
                                            Shipping from {eddData.sellerCity}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : pincode.length === 6 && !isLoading ? (
                    <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-orange-500" />
                        <p className="text-[11px] font-bold text-orange-700">
                            Serviceability check in progress or currently unavailable for this pincode.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                            <Truck size={14} className="text-gray-300" />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            Please enter your delivery pincode to see estimated delivery dates and shipping options.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryEstimator;
