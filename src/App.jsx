import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { check_auth } from './store/reducers/authReducer';
import { get_cart } from './store/reducers/wearCartReducer';

// Layout & Routes
import MainLayout from './layout/MainLayout';
import PrivateRoutes from './routes/PrivateRoutes';
import PublicRoutes from './routes/PublicRoutes';
import UserRoutes from './routes/UserRoutes';

// ✅ Eager — critical path (first paint)
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductList from './pages/ProductList/ProductList';
import ProductDetail from './pages/ProductDetail/ProductDetail';

// 🚀 Lazy — loaded on demand only
const Search = lazy(() => import('./pages/Search/Search'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails/OrderDetails'));
const MenuNameScreenPage = lazy(() => import('./pages/Menu/MenuNameScreenPage'));

// 🚀 Supplier pages — lazy (heavy, rarely visited by buyers)
const SupplierHub = lazy(() => import('./pages/SupplierHub/SupplierHub'));
const SupplierRegistration = lazy(() => import('./pages/SupplierRegistration/SupplierRegistration'));
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard/SupplierDashboard'));
const SupplierInventory = lazy(() => import('./pages/SupplierInventory/SupplierInventory'));
const SupplierMenu = lazy(() => import('./pages/SupplierMenu/SupplierMenu'));
const SupplierCatalogUpload = lazy(() => import('./pages/SupplierCatalogUpload/SupplierCatalogUpload'));
const SupplierOrders = lazy(() => import('./pages/SupplierOrders/SupplierOrders'));
const SupplierReturns = lazy(() => import('./pages/SupplierReturns/SupplierReturns'));
const SupplierPayments = lazy(() => import('./pages/SupplierPayments/SupplierPayments'));
const SupplierPricing = lazy(() => import('./pages/SupplierPricing/SupplierPricing'));
const SupplierWarehouse = lazy(() => import('./pages/SupplierWarehouse/SupplierWarehouse'));
const SupplierPromotions = lazy(() => import('./pages/SupplierPromotions/SupplierPromotions'));
const SupplierOfferZone = lazy(() => import('./pages/SupplierOfferZone/SupplierOfferZone'));
const SupplierPriceRecommendation = lazy(() => import('./pages/SupplierPriceRecommendation/SupplierPriceRecommendation'));
const SupplierQualityDashboard = lazy(() => import('./pages/SupplierQualityDashboard/SupplierQualityDashboard'));

// 🚀 Profile subpages — lazy
const Addresses = lazy(() => import('./pages/Profile/Addresses'));
const Wallet = lazy(() => import('./pages/Profile/Wallet'));
const EditProfile = lazy(() => import('./pages/Profile/EditProfile'));
const Language = lazy(() => import('./pages/Profile/Language'));
const AICustomerSupport = lazy(() => import('./pages/CustomerSupport/AICustomerSupport'));

import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';

// Legal Pages — lazy
const Terms = lazy(() => import('./pages/Legal/Terms'));
const Privacy = lazy(() => import('./pages/Legal/Privacy'));
const SecurityPolicy = lazy(() => import('./pages/Legal/SecurityPolicy'));

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
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center bg-green-600">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        }>
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
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
