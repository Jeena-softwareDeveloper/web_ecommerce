import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

// ── B2C Order Management ──

export const get_supplier_orders = createAsyncThunk(
    'vendor/get_supplier_orders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/orders');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_order_status = createAsyncThunk(
    'vendor/update_order_status',
    async ({ orderId, status, reason }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.put(`/wear/supplier/order-status/${orderId}`, { status, reason });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_supplier_order_detail = createAsyncThunk(
    'vendor/get_supplier_order_detail',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get(`/wear/supplier/order/${orderId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── B2B Order Management ──

export const get_b2b_orders = createAsyncThunk(
    'vendor/get_b2b_orders',
    async (status = 'all', { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get(`/wear/supplier/b2b/orders?status=${status}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_b2b_order_detail = createAsyncThunk(
    'vendor/get_b2b_order_detail',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get(`/wear/supplier/b2b/orders/${orderId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const accept_b2b_order = createAsyncThunk(
    'vendor/accept_b2b_order',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post(`/wear/supplier/b2b/orders/${orderId}/accept`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const reject_b2b_order = createAsyncThunk(
    'vendor/reject_b2b_order',
    async ({ orderId, reasonCode, reasonText }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post(`/wear/supplier/b2b/orders/${orderId}/reject`, { reasonCode, reasonText });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_b2b_status = createAsyncThunk(
    'vendor/update_b2b_status',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.patch(`/wear/supplier/b2b/orders/${orderId}/status`, { status });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_rejection_reasons = createAsyncThunk(
    'vendor/get_rejection_reasons',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/b2b/rejection-reasons');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── Dashboard & Analytics ──

export const get_supplier_dashboard_stats = createAsyncThunk(
    'vendor/get_supplier_dashboard_stats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/dashboard-stats');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_notifications = createAsyncThunk(
    'vendor/get_notifications',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/notifications', { params });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_offer_zone_data = createAsyncThunk(
    'vendor/get_offer_zone_data',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/offer-zone/data');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_financial_dashboard = createAsyncThunk(
    'vendor/get_financial_dashboard',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/settlements/financial-dashboard');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_settlement_history = createAsyncThunk(
    'vendor/get_settlement_history',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/settlements/history');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const request_payout = createAsyncThunk(
    'vendor/request_payout',
    async ({ amount }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post('/wear/supplier/settlements/request-payout', { amount });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── Catalog Management ──

export const get_my_catalogs = createAsyncThunk(
    'vendor/get_my_catalogs',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/catalog/my-list');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_catalog_details = createAsyncThunk(
    'vendor/get_catalog_details',
    async (catalogId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get(`/wear/supplier/catalog/${catalogId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_catalog_status = createAsyncThunk(
    'vendor/update_catalog_status',
    async ({ productId, status }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.patch(`/wear/supplier/catalog/status/${productId}`, { status });
            return { productId, status, ...data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const delete_catalog = createAsyncThunk(
    'vendor/delete_catalog',
    async (productId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.delete(`/wear/supplier/catalog/delete/${productId}`);
            return { productId, ...data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const scan_product_by_sku = createAsyncThunk(
    'vendor/scan_product_by_sku',
    async (sku, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get(`/wear/supplier/catalog/scan/${sku}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const add_catalog = createAsyncThunk(
    'vendor/add_catalog',
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.post('/wear/supplier/catalog/add', payload);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const edit_catalog = createAsyncThunk(
    'vendor/edit_catalog',
    async ({ catalogId, products, catalogInfo }, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.put(`/wear/supplier/catalog/supplier-edit/${catalogId}`, { products, catalogInfo });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_catalog_for_edit = createAsyncThunk(
    'vendor/get_catalog_for_edit',
    async (catalogId, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get(`/wear/supplier/catalog/${catalogId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_pricing_data = createAsyncThunk(
    'vendor/get_pricing_data',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/pricing/dashboard');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_price_recommendations = createAsyncThunk(
    'vendor/get_price_recommendations',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/pricing/recommendations');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_warehouse_data = createAsyncThunk(
    'vendor/get_warehouse_data',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/warehouse/data');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_quality_dashboard_data = createAsyncThunk(
    'vendor/get_quality_dashboard_data',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/quality-dashboard/data');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_promotions_data = createAsyncThunk(
    'vendor/get_promotions_data',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/promotions/data');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── Supplier Identity ──

export const get_supplier_status = createAsyncThunk(
    'vendor/get_supplier_status',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await apiClient.get('/wear/supplier/status');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const vendorSlice = createSlice({
    name: 'vendor',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        supplierData: null,
        supplierStatus: null,

        // Orders
        supplierOrders: [],
        currentOrder: null,
        b2bOrders: [],
        b2bCurrentOrder: null,
        b2bLoader: false,
        rejectionReasons: [],

        // Dashboard Stats
        totalSale: 0,
        totalOrder: 0,
        pendingOrder: 0,
        stats: {},
        recentOrders: [],
        recentMessages: [],

        // Catalog / Inventory
        myCatalogs: [],
        catalogDetails: null,

        // Notifications
        notifications: [],
        notificationSummary: {
            total: 0,
            unread: 0,
            read: 0
        },

        // Offer Zone
        offerZoneData: null,

        // Financials
        financialDashboard: null,
        settlementHistory: [],

        // Pricing
        pricingData: null,
        priceRecommendations: null,

        // Warehouse & Quality
        warehouseData: null,
        qualityData: null,

        // Promotions
        promotionsData: null
    },
    reducers: {
        messageClear: (state) => {
            state.successMessage = '';
            state.errorMessage = '';
        }
    },
    extraReducers: (builder) => {

        // ── B2C Orders ──
        builder.addCase(get_supplier_orders.pending, (state) => { state.loader = true; });
        builder.addCase(get_supplier_orders.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.supplierOrders = payload.orders || [];
        });
        builder.addCase(get_supplier_orders.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load orders';
        });

        builder.addCase(update_order_status.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Status updated';
            const index = state.supplierOrders.findIndex(o => o._id === payload.order?._id);
            if (index !== -1) {
                state.supplierOrders[index] = { ...state.supplierOrders[index], ...payload.order };
            }
        });

        builder.addCase(get_supplier_order_detail.fulfilled, (state, { payload }) => {
            state.currentOrder = payload.order || null;
        });

        // ── B2B Orders ──
        builder.addCase(get_b2b_orders.pending, (state) => { state.b2bLoader = true; });
        builder.addCase(get_b2b_orders.fulfilled, (state, { payload }) => {
            state.b2bLoader = false;
            state.b2bOrders = payload.orders || [];
        });
        builder.addCase(get_b2b_orders.rejected, (state, { payload }) => {
            state.b2bLoader = false;
            state.errorMessage = payload?.error || 'Failed to load B2B orders';
        });

        builder.addCase(get_b2b_order_detail.fulfilled, (state, { payload }) => {
            state.b2bCurrentOrder = payload.order || null;
        });

        builder.addCase(accept_b2b_order.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Order accepted';
            const index = state.b2bOrders.findIndex(o => o._id === payload.order?._id);
            if (index !== -1) {
                state.b2bOrders[index] = { ...state.b2bOrders[index], ...payload.order };
            }
        });

        builder.addCase(reject_b2b_order.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Order rejected';
            const index = state.b2bOrders.findIndex(o => o._id === payload.order?._id);
            if (index !== -1) {
                state.b2bOrders[index] = { ...state.b2bOrders[index], ...payload.order };
            }
        });

        builder.addCase(update_b2b_status.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Status updated';
            const index = state.b2bOrders.findIndex(o => o._id === payload.order?._id);
            if (index !== -1) {
                state.b2bOrders[index] = { ...state.b2bOrders[index], ...payload.order };
            }
        });

        builder.addCase(get_rejection_reasons.fulfilled, (state, { payload }) => {
            state.rejectionReasons = payload.reasons || [];
        });

        // ── Supplier Status ──
        builder.addCase(get_supplier_status.fulfilled, (state, { payload }) => {
            state.supplierStatus = payload?.data?.status || 'none';
        });
        builder.addCase(get_supplier_status.rejected, (state) => {
            state.supplierStatus = 'none';
        });

        // ── Dashboard ──
        builder.addCase(get_supplier_dashboard_stats.pending, (state) => {
            state.loader = true;
        });
        builder.addCase(get_supplier_dashboard_stats.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.stats = payload.stats || {};
            state.totalSale = payload.stats?.totalSales || 0;
            state.totalOrder = payload.stats?.totalOrders || 0;
            state.pendingOrder = payload.stats?.pendingShipments || 0;
            state.recentOrders = payload.recentOrders || [];
            state.recentMessages = payload.recentMessages || [];
            state.supplierData = {
                _id: payload._id,
                status: payload.status,
                shopName: payload.shopName
            };
        });
        builder.addCase(get_supplier_dashboard_stats.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load dashboard data';
        });

        // ── Notifications ──
        builder.addCase(get_notifications.fulfilled, (state, { payload }) => {
            state.notifications = payload.notifications || [];
            state.notificationSummary = payload.summary || state.notificationSummary;
        });

        // ── Offer Zone ──
        builder.addCase(get_offer_zone_data.pending, (state) => {
            state.loader = true;
        });
        builder.addCase(get_offer_zone_data.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.offerZoneData = payload.data || payload;
        });
        builder.addCase(get_offer_zone_data.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load offer zone';
        });

        // ── Financials ──
        builder.addCase(get_financial_dashboard.pending, (state) => {
            state.loader = true;
        });
        builder.addCase(get_financial_dashboard.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.financialDashboard = payload.dashboard || payload.data || payload;
        });
        builder.addCase(get_financial_dashboard.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load financial dashboard';
        });

        builder.addCase(get_settlement_history.fulfilled, (state, { payload }) => {
            state.settlementHistory = payload.history || [];
        });

        builder.addCase(request_payout.pending, (state) => { state.loader = true; });
        builder.addCase(request_payout.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message || 'Payout request submitted successfully';
        });
        builder.addCase(request_payout.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to submit payout request';
        });

        // ── Catalog Management ──
        builder.addCase(get_my_catalogs.pending, (state) => {
            state.loader = true;
        });
        builder.addCase(get_my_catalogs.fulfilled, (state, { payload }) => {
            state.loader = false;
            const deletedIds = JSON.parse(localStorage.getItem('locally_deleted_catalogs') || '[]');
            
            let activeCatalogs = (payload.catalogs || []).filter(c => !deletedIds.includes(c._id));
            
            activeCatalogs = activeCatalogs.map(c => {
                if (c.similarProducts) {
                    const filteredSub = c.similarProducts.filter(sub => !deletedIds.includes(sub._id));
                    return {
                        ...c,
                        similarProducts: filteredSub,
                        similarProductsCount: Math.max(1, filteredSub.length)
                    };
                }
                return c;
            });
            
            state.myCatalogs = activeCatalogs;
        });
        builder.addCase(get_my_catalogs.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load catalogs';
        });

        builder.addCase(get_catalog_details.fulfilled, (state, { payload }) => {
            state.catalogDetails = payload.catalog;
            const deletedIds = JSON.parse(localStorage.getItem('locally_deleted_catalogs') || '[]');
            const index = state.myCatalogs.findIndex(c => c._id === payload.catalog?.catalogId || c._id === payload.catalog?._id);
            if (index !== -1) {
                const rawSimilar = payload.catalog?.similarProducts || [];
                const filteredSimilar = rawSimilar.filter(sub => !deletedIds.includes(sub._id));
                state.myCatalogs[index] = { 
                    ...state.myCatalogs[index], 
                    similarProducts: filteredSimilar,
                    similarProductsCount: Math.max(1, filteredSimilar.length)
                };
            }
        });

        builder.addCase(update_catalog_status.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message;
            // 1. Try to find parent catalog directly
            const index = state.myCatalogs.findIndex(c => c._id === payload.productId);
            if (index !== -1) {
                state.myCatalogs[index].status = payload.status;
            } else {
                // 2. Try to find the catalog that contains this subProduct in its similarProducts
                state.myCatalogs = state.myCatalogs.map(c => {
                    if (c.similarProducts && c.similarProducts.some(sub => sub._id === payload.productId)) {
                        const updatedSubProducts = c.similarProducts.map(sub => 
                            sub._id === payload.productId ? { ...sub, status: payload.status } : sub
                        );
                        // Since all products in a catalog group toggle status together on the server, we update parent and subProducts
                        return { ...c, status: payload.status, similarProducts: updatedSubProducts };
                    }
                    return c;
                });
            }
        });

        builder.addCase(delete_catalog.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Catalog deleted successfully';
            
            // Store deleted ID to localStorage to exclude from subsequent fetches/reloads
            const deletedIds = JSON.parse(localStorage.getItem('locally_deleted_catalogs') || '[]');
            if (!deletedIds.includes(payload.productId)) {
                deletedIds.push(payload.productId);
                localStorage.setItem('locally_deleted_catalogs', JSON.stringify(deletedIds));
            }
            
            // 1. Try to filter out from parent catalogs list (if it was a single product catalog)
            const existsInMain = state.myCatalogs.some(c => c._id === payload.productId);
            if (existsInMain) {
                state.myCatalogs = state.myCatalogs.filter(c => c._id !== payload.productId);
            } else {
                // 2. Try to filter out from similarProducts of parent catalogs
                state.myCatalogs = state.myCatalogs.map(c => {
                    if (c.similarProducts && c.similarProducts.some(sub => sub._id === payload.productId)) {
                        const updatedSubProducts = c.similarProducts.filter(sub => sub._id !== payload.productId);
                        return {
                            ...c,
                            similarProducts: updatedSubProducts,
                            similarProductsCount: Math.max(1, updatedSubProducts.length)
                        };
                    }
                    return c;
                });
            }
        });

        builder.addCase(add_catalog.pending, (state) => {
            state.loader = true;
        });
        builder.addCase(add_catalog.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message || 'Catalog added successfully';
        });
        builder.addCase(add_catalog.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to add catalog';
        });

        builder.addCase(edit_catalog.pending, (state) => {
            state.loader = true;
        });
        builder.addCase(edit_catalog.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message || 'Catalog updated successfully';
        });
        builder.addCase(edit_catalog.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to update catalog';
        });

        builder.addCase(get_catalog_for_edit.fulfilled, (state, { payload }) => {
            state.catalogDetails = payload.catalog;
        });

        // ── Pricing ──
        builder.addCase(get_pricing_data.pending, (state) => { state.loader = true; });
        builder.addCase(get_pricing_data.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.pricingData = payload.data || payload;
        });
        builder.addCase(get_pricing_data.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load pricing data';
        });

        builder.addCase(get_price_recommendations.pending, (state) => { state.loader = true; });
        builder.addCase(get_price_recommendations.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.priceRecommendations = payload || payload.data;
        });
        builder.addCase(get_price_recommendations.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load price recommendations';
        });

        // ── Warehouse & Quality ──
        builder.addCase(get_warehouse_data.pending, (state) => { state.loader = true; });
        builder.addCase(get_warehouse_data.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.warehouseData = payload;
        });
        builder.addCase(get_warehouse_data.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load warehouse data';
        });

        builder.addCase(get_quality_dashboard_data.pending, (state) => { state.loader = true; });
        builder.addCase(get_quality_dashboard_data.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.qualityData = payload;
        });
        builder.addCase(get_quality_dashboard_data.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load quality data';
        });

        // ── Promotions ──
        builder.addCase(get_promotions_data.pending, (state) => { state.loader = true; });
        builder.addCase(get_promotions_data.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.promotionsData = payload;
        });
        builder.addCase(get_promotions_data.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load promotions data';
        });
    }
});

export const { messageClear } = vendorSlice.actions;
export default vendorSlice.reducer;