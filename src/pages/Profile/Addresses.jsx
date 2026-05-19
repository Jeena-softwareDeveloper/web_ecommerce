import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Home, Briefcase, X, Check } from 'lucide-react';
import CommonHeader from '../../components/layout/CommonHeader';
import { get_addresses, delete_address, add_address, update_address, clear_message } from '../../store/reducers/addressReducer';
import { toast } from "sonner";

const Addresses = ({ desktopEmbedded = false }) => {
    const dispatch = useDispatch();
    const { addresses, loader, successMessage, errorMessage } = useSelector(state => state.address);
    const { userInfo } = useSelector(state => state.auth);
    const { profileInfo } = useSelector(state => state.profile);
    
    const [showAddForm, setShowAddForm] = useState(false);
    const [editAddressId, setEditAddressId] = useState(null);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: profileInfo?.name || userInfo?.name || '',
        phone: profileInfo?.phone || userInfo?.phone || '',
        pincode: '',
        state: '',
        city: '',
        area: '',
        houseNo: '',
        type: 'Home'
    });

    useEffect(() => {
        dispatch(get_addresses());
    }, [dispatch]);

    // Smart Pincode Logic from Checkout
    useEffect(() => {
        const fetchLocation = async () => {
            if (formData.pincode?.length === 6) {
                setIsPincodeLoading(true);
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = await res.json();
                    if (data[0]?.Status === "Success") {
                        const postOffice = data[0].PostOffice[0];
                        setFormData(prev => ({
                            ...prev,
                            city: postOffice.District,
                            state: postOffice.State,
                            area: prev.area || postOffice.Name
                        }));
                        toast.success(`Location identified: ${postOffice.District}`);
                    }
                } catch (err) {
                    console.error("Pincode fetch error:", err);
                } finally {
                    setIsPincodeLoading(false);
                }
            }
        };
        fetchLocation();
    }, [formData.pincode]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(clear_message());
            closeModal();
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(clear_message());
        }
    }, [successMessage, errorMessage, dispatch]);

    const closeModal = () => {
        setShowAddForm(false);
        setEditAddressId(null);
        setFormData({
            name: profileInfo?.name || userInfo?.name || '',
            phone: profileInfo?.phone || userInfo?.phone || '',
            pincode: '',
            state: '',
            city: '',
            area: '',
            houseNo: '',
            type: 'Home'
        });
    };

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (addr) => {
        setEditAddressId(addr._id);
        setFormData({
            name: addr.name,
            phone: addr.phone,
            pincode: addr.pincode,
            state: addr.state,
            city: addr.city,
            area: addr.area,
            houseNo: addr.houseNo,
            type: addr.type
        });
        setShowAddForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editAddressId) {
            dispatch(update_address({ id: editAddressId, info: formData }));
        } else {
            dispatch(add_address(formData));
        }
    };

    const renderAddModal = () => (
        <AnimatePresence>
            {showAddForm && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4"
                    onClick={closeModal}
                >
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">{editAddressId ? 'Update Delivery Address' : 'Add New Delivery Address'}</h2>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">{editAddressId ? 'Update your delivery details' : 'Where should we deliver your orders?'}</p>
                            </div>
                            <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-8 overflow-y-auto no-scrollbar space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input name="name" required value={formData.name} onChange={handleInput} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" placeholder="Recipient Name" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input name="phone" required value={formData.phone} onChange={handleInput} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" placeholder="Contact No." />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">6-Digit Pincode</label>
                                    <div className="relative">
                                        <input name="pincode" required value={formData.pincode} onChange={handleInput} type="tel" maxLength={6} className="w-full bg-rose-50/20 border border-red-100 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" placeholder="6-Digit Pincode" />
                                        {isPincodeLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">House No / Flat / Building</label>
                                    <input name="houseNo" required value={formData.houseNo} onChange={handleInput} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 402, Royal Residency" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area / Landmark</label>
                                    <input name="area" required value={formData.area} onChange={handleInput} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Near City Mall" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Town</label>
                                        <input readOnly name="city" required value={formData.city} type="text" className="w-full bg-blue-50/30 border border-blue-100/50 rounded-xl p-4 font-bold text-gray-800 cursor-not-allowed" placeholder="City" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                                        <input readOnly name="state" required value={formData.state} type="text" className="w-full bg-blue-50/30 border border-blue-100/50 rounded-xl p-4 font-bold text-gray-800 cursor-not-allowed" placeholder="State" />
                                    </div>
                                </div>

                                <div className="space-y-3 pb-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Address Type</label>
                                    <div className="flex gap-3">
                                        {['Home', 'Office', 'Other'].map(type => (
                                            <button 
                                                key={type} type="button" 
                                                onClick={() => setFormData({...formData, type})}
                                                className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.type === type ? 'bg-primary border-primary text-white shadow-lg shadow-rose-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white">
                                <button 
                                    className="w-full bg-primary py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer"
                                    type="submit"
                                    disabled={loader}
                                >
                                    {loader ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{editAddressId ? 'Update Address' : 'Save Address'} <Check size={16} /></>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (desktopEmbedded) {
        return (
            <div>
                <div className="pb-6 mb-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Manage Addresses</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Manage delivery locations for quick checkout across Jeenora</p>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all cursor-pointer"
                    >
                        <Plus size={16} /> <span>Add New Address</span>
                    </button>
                </div>

                {renderAddModal()}

                {loader && addresses.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                        <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">No delivery addresses saved</p>
                        <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-primary/90 transition-colors cursor-pointer">
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {addresses.map((address) => (
                            <div key={address._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-start group hover:border-indigo-100 hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                                        {address.type === 'Office' ? <Briefcase className="text-gray-500" size={20} /> : <Home className="text-gray-500" size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-black text-gray-900 text-base tracking-tight">{address.name}</h4>
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">{address.type}</span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 leading-relaxed mb-3">
                                            {address.houseNo}, {address.area}<br />
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-800">{address.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleEdit(address)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer">
                                        <Plus size={16} className="rotate-45" />
                                    </button>
                                    <button onClick={() => dispatch(delete_address(address._id))} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[52px] md:pt-[90px]">
            <CommonHeader title="My Addresses" />
            
            <div className="px-4 py-6 max-w-2xl mx-auto w-full">
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-white border-2 border-dashed border-gray-200 rounded-3xl p-5 mb-6 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors group"
                >
                    <Plus size={20} className="text-primary" />
                    <span className="text-sm font-semibold text-secondary uppercase tracking-widest">Add New Address</span>
                </button>

                {renderAddModal()}

                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div key={address._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-start group">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                    {address.type === 'Office' ? <Briefcase className="text-gray-400" size={20} /> : <Home className="text-gray-400" size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-secondary text-sm">{address.name}</h4>
                                        <span className="bg-gray-100 text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md text-gray-500">{address.type}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 leading-relaxed">
                                        {address.houseNo}, {address.area}<br />
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    <p className="text-[11px] font-semibold text-secondary mt-2">{address.phone}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleEdit(address)} className="p-2 text-gray-300 hover:text-primary hover:bg-rose-50 rounded-xl transition-all">
                                    <Plus size={18} />
                                </button>
                                <button onClick={() => dispatch(delete_address(address._id))} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {addresses.length === 0 && !loader && (
                        <div className="text-center py-10 opacity-30">
                            <MapPin size={48} className="mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest">No addresses saved yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Addresses;
