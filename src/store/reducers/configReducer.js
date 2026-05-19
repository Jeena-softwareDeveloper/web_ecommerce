import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_config = createAsyncThunk(
    'config/get_config',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/config/initial-data');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_active_banners = createAsyncThunk(
    'config/get_active_banners',
    async (params, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/banners/active', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const track_banner_click = createAsyncThunk(
    'config/track_banner_click',
    async (bannerId) => {
        try {
            await apiClient.post(`/wear/banners/track-click/${bannerId}`);
        } catch (error) {
            // silent
        }
    }
);

export const get_nav_menu = createAsyncThunk(
    'config/get_nav_menu',
    async (platform, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/config/nav-menu/${platform}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const configSlice = createSlice({
    name: 'config',
    initialState: {
        loader: false,
        wearConfig: {
            is_cod_enabled: true,
            cod_min_amount: 1,
            cod_max_amount: 20000,
            cod_charge: 0,
            min_online_payment_amount: 1
        },
        paymentKeys: {
            cashfreeAppId: '',
            cashfreeEnvironment: 'SANDBOX'
        },
        banners: [],
        categories: [],
        languages: [],
        businessTypes: [],
        navMenu: {
            supplier: [],
            customer: []
        }
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(get_config.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_config.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.wearConfig = payload.wearConfig || state.wearConfig;
                state.banners = payload.banners || [];
                state.categories = payload.categories || [];
                state.languages = payload.languages || [];
                state.businessTypes = payload.businessTypes || [];
                state.paymentKeys = payload.paymentKeys || state.paymentKeys;
            })
            .addCase(get_config.rejected, (state) => {
                state.loader = false;
            })
            .addCase(get_active_banners.fulfilled, (state, { payload }) => {
                state.banners = payload.banners || [];
            })
            .addCase(get_nav_menu.fulfilled, (state, { payload }) => {
                const { platform, menu } = payload;
                if (platform) {
                    state.navMenu[platform] = menu || [];
                }
            });
    }
});

export default configSlice.reducer;
