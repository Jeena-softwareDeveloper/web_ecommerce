import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { check_auth } from './store/reducers/authReducer';
import { get_cart } from './store/reducers/wearCartReducer';

// Layout & Routes
import MainLayout from './layout/MainLayout';
import PrivateRoutes from './routes/PrivateRoutes';
import PublicRoutes from './routes/PublicRoutes';
import UserRoutes from './routes/UserRoutes';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Search from './pages/Search/Search';
import ProductList from './pages/ProductList/ProductList';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Profile from './pages/Profile/Profile';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';

import Orders from './pages/Orders/Orders';
import OrderDetails from './pages/OrderDetails/OrderDetails';
import SupplierHub from './pages/SupplierHub/SupplierHub';
import SupplierRegistration from './pages/SupplierRegistration/SupplierRegistration';
import SupplierDashboard from './pages/SupplierDashboard/SupplierDashboard';
import SupplierInventory from './pages/SupplierInventory/SupplierInventory';
import SupplierMenu from './pages/SupplierMenu/SupplierMenu';
import SupplierCatalogUpload from './pages/SupplierCatalogUpload/SupplierCatalogUpload';
import SupplierOrders from './pages/SupplierOrders/SupplierOrders';
import SupplierReturns from './pages/SupplierReturns/SupplierReturns';
import SupplierPayments from './pages/SupplierPayments/SupplierPayments';
import SupplierPricing from './pages/SupplierPricing/SupplierPricing';
import SupplierWarehouse from './pages/SupplierWarehouse/SupplierWarehouse';
import SupplierPromotions from './pages/SupplierPromotions/SupplierPromotions';
import SupplierOfferZone from './pages/SupplierOfferZone/SupplierOfferZone';
import SupplierPriceRecommendation from './pages/SupplierPriceRecommendation/SupplierPriceRecommendation';
import SupplierQualityDashboard from './pages/SupplierQualityDashboard/SupplierQualityDashboard';
import MenuNameScreenPage from './pages/Menu/MenuNameScreenPage';

// Profile Subpages
import Addresses from './pages/Profile/Addresses';
import Wallet from './pages/Profile/Wallet';
import EditProfile from './pages/Profile/EditProfile';
import Language from './pages/Profile/Language';
import AICustomerSupport from './pages/CustomerSupport/AICustomerSupport';

import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';

// Legal Pages
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import SecurityPolicy from './pages/Legal/SecurityPolicy';

// 404
import NotFound from './pages/NotFound/NotFound';

function App() {
  const dispatch = useDispatch();
  const { hasCheckedAuth, token } = useSelector(state => state.auth || {});

  useEffect(() => {
    dispatch(check_auth());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(get_cart());
    }
  }, [dispatch, token]);

  if (!hasCheckedAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <ScrollToTop />
        <Toaster 
          position="bottom-center" 
          richColors 
          offset={20} 
          expand={false}
          toastOptions={{
            style: {
              borderRadius: '50px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: 'none',
              maxWidth: '90vw',
              width: 'auto',
              whiteSpace: 'normal',
              textAlign: 'center',
              margin: '0 auto',
            },
          }}
        />
        <Routes>
        {/* Public Routes without Layout */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        </Route>

        {/* Global Routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="menu" element={<MenuNameScreenPage />} />
          
          {/* Legal Routes */}
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="security-policy" element={<SecurityPolicy />} />
          
          {/* User Specific Routes */}
          <Route element={<UserRoutes />}>
            <Route path="cart" element={<Cart />} />
            <Route path="supplier-hub" element={<SupplierHub />} />
            <Route path="supplier-registration" element={<SupplierRegistration />} />
            <Route path="supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="supplier-inventory" element={<SupplierInventory />} />
            <Route path="supplier-menu" element={<SupplierMenu />} />
            <Route path="catalog-upload" element={<SupplierCatalogUpload />} />
            <Route path="supplier-orders" element={<SupplierOrders />} />
            <Route path="supplier-returns" element={<SupplierReturns />} />
            <Route path="supplier-payments" element={<SupplierPayments />} />
            <Route path="supplier-pricing" element={<SupplierPricing />} />
            <Route path="supplier-warehouse" element={<SupplierWarehouse />} />
            <Route path="supplier-promotions" element={<SupplierPromotions />} />
            <Route path="offer-zone" element={<SupplierOfferZone />} />
            <Route path="supplier-price-recommendation" element={<SupplierPriceRecommendation />} />
            <Route path="supplier-quality-dashboard" element={<SupplierQualityDashboard />} />
            <Route path="become-supplier" element={<SupplierRegistration />} />
            <Route path="orders" element={<Orders />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoutes />}>
            <Route path="profile" element={<Profile />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="language" element={<Language />} />
            <Route path="support" element={<AICustomerSupport />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-details/:orderId" element={<OrderDetails />} />

          </Route>
        </Route>

      {/* Full Screen Special Routes (No Layout) */}
        <Route element={<PrivateRoutes />}>
          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

        {/* 🔴 Security: Catch-all 404 — prevents silent 200 on unknown routes */}
        <Route path="*" element={<NotFound />} />

        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
