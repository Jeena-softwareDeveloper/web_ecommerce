import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { get_supplier_status } from '../../store/reducers/vendorReducer';

const SupplierHub = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector(state => state.auth);
    const { supplierStatus } = useSelector(state => state.vendor);

    const navigated = React.useRef(false);
    
    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        dispatch(get_supplier_status());
    }, [dispatch, token, navigate]);

    useEffect(() => {
        if (token && supplierStatus && !navigated.current) {
            navigated.current = true;
            if (supplierStatus === 'approved') {
                navigate('/supplier-dashboard', { replace: true });
            } else if (supplierStatus === 'pending') {
                // Stay here or go to profile with a toast (toast handled in Profile already)
                navigate('/profile', { replace: true });
            } else {
                navigate('/supplier-registration', { replace: true });
            }
        }
    }, [token, supplierStatus, navigate]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                <p className="text-xs font-black uppercase tracking-widest text-[#D80032] animate-pulse">
                    Jeenora Supplier Hub • Entering Dashboard...
                </p>
            </div>
        </div>
    );
};

export default SupplierHub;
