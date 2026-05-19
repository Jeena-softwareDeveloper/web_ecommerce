import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, Loader2, Navigation } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { toast } from "sonner";
import { update_profile, profile_image_upload, messageClear } from '../../store/reducers/profileReducer';
import apiClient from '../../api/apiClient';

const EditProfile = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const { profileInfo, loader, successMessage, errorMessage } = useSelector(state => state.profile);
    
    const [formData, setFormData] = useState({
        name: profileInfo?.name || '',
        email: profileInfo?.email || '',
        phone: profileInfo?.phone || '',
        pincode: profileInfo?.pincode || '',
        city: profileInfo?.city || '',
        state: profileInfo?.state || ''
    });

    const [imagePreview, setImagePreview] = useState(profileInfo?.image || null);
    const [isDetecting, setIsDetecting] = useState(false);

    useEffect(() => {
        if (profileInfo) {
            setFormData({
                name: profileInfo.name || '',
                email: profileInfo.email || '',
                phone: profileInfo.phone || '',
                pincode: profileInfo.pincode || '',
                city: profileInfo.city || '',
                state: profileInfo.state || ''
            });
            setImagePreview(profileInfo.image || null);
        }
    }, [profileInfo]);

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
                    setFormData(prev => ({
                        ...prev,
                        pincode: res.data.pincode || prev.pincode,
                        city: res.data.city || prev.city,
                        state: res.data.state || prev.state
                    }));
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

    const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to server
            const uploadData = new FormData();
            uploadData.append('image', file);
            dispatch(profile_image_upload(uploadData));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Name is required");
        
        dispatch(update_profile(formData));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
            <CommonHeader title="Edit Profile" />
            
            <div className="px-4 py-8 max-w-xl mx-auto w-full">
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                        {imagePreview ? (
                            <img src={imagePreview} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl" alt="avatar" />
                        ) : (
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center border-4 border-white shadow-2xl text-primary">
                                <span className="text-4xl font-black uppercase">
                                    {(formData.name || 'G').charAt(0)}
                                </span>
                            </div>
                        )}
                        <button 
                            type="button"
                            onClick={handleImageClick}
                            className="absolute bottom-0 right-0 bg-[#e11955] text-white p-3 rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95"
                        >
                            <Camera size={18} />
                        </button>
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <h3 className="mt-4 font-black text-secondary text-lg uppercase tracking-wider">{formData.name || 'Guest'}</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] ml-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    name="name" value={formData.name} onChange={handleInput}
                                    placeholder="Enter your full name"
                                    className="w-full bg-white border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold outline-primary shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] ml-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    name="phone" value={formData.phone} onChange={handleInput}
                                    placeholder="Enter phone number"
                                    className="w-full bg-white border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold outline-primary shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] ml-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                name="email" value={formData.email} onChange={handleInput} disabled
                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed shadow-sm"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 ml-2 italic">Email cannot be changed</p>
                    </div>

                    <div className="h-px bg-gray-100 my-4" />

                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] ml-2">Location Details</label>
                        <button 
                            type="button"
                            onClick={detectLocation}
                            disabled={isDetecting}
                            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                        >
                            {isDetecting ? <Loader2 className="animate-spin" size={12} /> : <Navigation size={12} />}
                            {isDetecting ? 'Detecting...' : 'Auto Detect'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 ml-2">Pincode</label>
                            <input 
                                name="pincode" value={formData.pincode} onChange={handleInput}
                                placeholder="600001"
                                className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-primary shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 ml-2">City</label>
                            <input 
                                name="city" value={formData.city} onChange={handleInput}
                                placeholder="Chennai"
                                className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-primary shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 ml-2">State</label>
                            <input 
                                name="state" value={formData.state} onChange={handleInput}
                                placeholder="Tamil Nadu"
                                className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-primary shadow-sm"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loader}
                        className="w-full bg-[#e11955] text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-100 mt-10 uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loader ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        {loader ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
