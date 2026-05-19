import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { storage } from '../../utils/storage';

const ActivityLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const logActivity = async () => {
      try {
        const deviceId = storage.getDeviceId();
        
        let action = 'PAGE_VIEW';
        if (location.pathname.includes('/product/')) action = 'PRODUCT_VIEW';
        else if (location.pathname.includes('/cart')) action = 'CART_VIEW';
        else if (location.pathname.includes('/checkout')) action = 'CHECKOUT_START';
        else if (location.pathname.includes('/orders')) action = 'ORDER_HISTORY';
        else if (location.pathname.includes('/login')) action = 'LOGIN_PAGE';
        else if (location.pathname.includes('/register')) action = 'REGISTER_PAGE';
        else if (location.pathname.includes('/search')) action = 'SEARCH_QUERY';
        else if (location.pathname.includes('/supplier')) action = 'SUPPLIER_PORTAL';

        await apiClient.post('/wear/logs/log', {
          action,
          details: {
            page: location.pathname,
            title: document.title || 'Ecommerce Storefront',
          },
          device: {
            deviceId,
            platform: 'Web (Ecommerce)',
            userAgent: navigator.userAgent
          }
        }, { skipToast: true });
      } catch (error) {
        // Silent catch to prevent disrupting user experience
      }
    };

    logActivity();
  }, [location.pathname]);

  return null;
};

export default ActivityLogger;
