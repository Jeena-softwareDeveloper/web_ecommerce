import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const get_hsn_gst = createAsyncThunk(
    'supplierStock/get_hsn_gst',
    async (hsn, { rejectWithValue }) => {
        try {
            const res = await apiClient.get(`/wear/supplier/stock/hsn-gst?hsn=${hsn}`, { skipToast: true });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const get_stock_list = createAsyncThunk(
    'supplierStock/get_stock_list',
    async (status = 'all', { rejectWithValue }) => {
        try {
            const res = await apiClient.get(`/wear/supplier/stock/list?status=${status}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const get_stock_detail = createAsyncThunk(
    'supplierStock/get_stock_detail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await apiClient.get(`/wear/supplier/stock/${id}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const add_stock = createAsyncThunk(
    'supplierStock/add_stock',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await apiClient.post('/wear/supplier/stock/add', payload);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const update_stock = createAsyncThunk(
    'supplierStock/update_stock',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await apiClient.patch(`/wear/supplier/stock/${id}`, data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const request_listing = createAsyncThunk(
    'supplierStock/request_listing',
    async ({ id, supplierNote }, { rejectWithValue }) => {
        try {
            const res = await apiClient.post(`/wear/supplier/stock/${id}/request-listing`, { supplierNote });
            return { ...res.data, id };
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const update_variant_stock = createAsyncThunk(
    'supplierStock/update_variant_stock',
    async ({ id, color, size, newStock }, { rejectWithValue }) => {
        try {
            const res = await apiClient.patch(`/wear/supplier/stock/${id}/stock-update`, { color, size, newStock });
            return { ...res.data, id, color, size, newStock };
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔹 NEW: Bulk stock update
export const bulk_update_variant_stock = createAsyncThunk(
    'supplierStock/bulk_update_variant_stock',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const res = await apiClient.patch(`/wear/supplier/stock/${id}/bulk-stock-update`, { updates });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔹 NEW: Get inventory alerts
export const get_inventory_alerts = createAsyncThunk(
    'supplierStock/get_inventory_alerts',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiClient.get('/wear/supplier/stock/alerts');
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔹 NEW: Update warehouse location
export const update_warehouse_location = createAsyncThunk(
    'supplierStock/update_warehouse_location',
    async ({ id, warehouseLocation }, { rejectWithValue }) => {
        try {
            const res = await apiClient.patch(`/wear/supplier/stock/${id}/warehouse`, { warehouseLocation });
            return { ...res.data, id, warehouseLocation };
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const supplierStockSlice = createSlice({
    name: 'supplierStock',
    initialState: {
        stocks: [],
        currentStock: null,
        loader: false,
        successMessage: '',
        errorMessage: '',
        alerts: [],
        alertCount: 0
    },
    reducers: {
        messageClear: (state) => {
            state.successMessage = '';
            state.errorMessage = '';
        }
    },
    extraReducers: (builder) => {
        // get list
        builder.addCase(get_stock_list.pending, state => { state.loader = true; });
        builder.addCase(get_stock_list.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.stocks = payload.stocks || [];
        });
        builder.addCase(get_stock_list.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to load stocks';
        });

        // get detail
        builder.addCase(get_stock_detail.fulfilled, (state, { payload }) => {
            state.currentStock = payload.stock;
        });

        // add
        builder.addCase(add_stock.pending, state => { state.loader = true; });
        builder.addCase(add_stock.fulfilled, (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message || 'Stock added';
        });
        builder.addCase(add_stock.rejected, (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to add stock';
        });

        // request listing
        builder.addCase(request_listing.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message;
            const item = state.stocks.find(s => s._id === payload.id);
            if (item) item.status = 'pending_approval';
            if (state.currentStock?._id === payload.id) state.currentStock.status = 'pending_approval';
        });
        builder.addCase(request_listing.rejected, (state, { payload }) => {
            state.errorMessage = payload?.error || 'Request failed';
        });

        // update variant stock (inline edit)
        builder.addCase(update_variant_stock.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Stock updated';
        });
        builder.addCase(update_variant_stock.rejected, (state, { payload }) => {
            state.errorMessage = payload?.error || 'Update failed';
        });

        // 🔹 NEW: inventory alerts
        builder.addCase(get_inventory_alerts.fulfilled, (state, { payload }) => {
            state.alerts = payload.alerts || [];
            state.alertCount = payload.alertCount || 0;
        });
        builder.addCase(get_inventory_alerts.rejected, (state) => {
            state.alerts = [];
            state.alertCount = 0;
        });

        // 🔹 NEW: warehouse location
        builder.addCase(update_warehouse_location.fulfilled, (state, { payload }) => {
            state.successMessage = payload.message || 'Warehouse updated';
            if (state.currentStock && state.currentStock._id === payload.id) {
                state.currentStock.warehouseLocation = payload.warehouseLocation;
            }
        });
    }
});

export const { messageClear } = supplierStockSlice.actions;
export default supplierStockSlice.reducer;