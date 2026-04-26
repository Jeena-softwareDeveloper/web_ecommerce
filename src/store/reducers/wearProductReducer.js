import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_wear_products = createAsyncThunk(
    'wearProduct/get_wear_products',
    async (params, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/home/products/all', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_product_details = createAsyncThunk(
    'wearProduct/get_product_details',
    async (slug, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/home/products/details/${slug}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_related_products = createAsyncThunk(
    'wearProduct/get_related_products',
    async ({ category, productId }, { fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/home/products/related', { params: { category, productId } });
            return fulfillWithValue(response.data);
        } catch (error) {
            return fulfillWithValue({ related: [] });
        }
    }
);

export const get_similar_products = createAsyncThunk(
    'wearProduct/get_similar_products',
    async ({ catalogId, productId }, { fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/home/products/similar', { params: { catalogId, productId } });
            return fulfillWithValue(response.data);
        } catch (error) {
            return fulfillWithValue({ similar: [] });
        }
    }
);

export const get_product_social_stats = createAsyncThunk(
    'wearProduct/get_product_social_stats',
    async (productIds, { fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/home/products/social-stats', { productIds });
            return fulfillWithValue(response.data);
        } catch (error) {
            return fulfillWithValue({ stats: {} });
        }
    }
);

export const get_search_suggestions = createAsyncThunk(
    'wearProduct/get_search_suggestions',
    async (query, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/search/suggestions', { params: { q: query } });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const save_search_query = createAsyncThunk(
    'wearProduct/save_search_query',
    async ({ q, deviceId }, { rejectWithValue }) => {
        try {
            await apiClient.post('/search/save', { q, deviceId });
        } catch (error) {
            // silent
        }
    }
);

export const get_search_history = createAsyncThunk(
    'wearProduct/get_search_history',
    async (deviceId, { fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/search/history', { params: { deviceId } });
            return fulfillWithValue(response.data);
        } catch (error) {
            return fulfillWithValue({ history: [] });
        }
    }
);

export const get_trending_data = createAsyncThunk(
    'wearProduct/get_trending_data',
    async (_, { fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/search/trending');
            return fulfillWithValue(response.data);
        } catch (error) {
            return fulfillWithValue({ trendingQueries: [], trendingProducts: [] });
        }
    }
);

export const get_top_rated_products = createAsyncThunk(
    'wearProduct/get_top_rated_products',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/home/products/top-rated');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_recent_products = createAsyncThunk(
    'wearProduct/get_recent_products',
    async (userId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/home/products/recent/${userId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_delivery_estimate = createAsyncThunk(
    'wearProduct/get_delivery_estimate',
    async ({ productId, pincode }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/delivery/edd?productId=${productId}&deliveryPincode=${pincode}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const wearProductSlice = createSlice({
    name: 'wearProduct',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        products: [],
        totalProducts: 0,
        productDetails: null,
        suggestions: [],
        searchHistory: [],
        trendingQueries: [],
        trendingProducts: [],
        topRatedProducts: [],
        deliveryInfo: null,
        relatedProducts: [],
        similarProducts: [],
        recentProducts: [],
        socialStats: {}
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        reset_product_details: (state) => {
            state.productDetails = null;
        },
        reset_wear_products: (state) => {
            state.products = [];
            state.totalProducts = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_wear_products.pending, (state) => {
                state.loader = true;
                state.products = [];
            })
            .addCase(get_wear_products.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.products = payload.products || [];
                state.totalProducts = payload.totalProducts || payload.totalProduct || 0;
            })
            .addCase(get_wear_products.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to fetch products';
            })
            .addCase(get_product_details.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_product_details.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.productDetails = payload.product || payload;
            })
            .addCase(get_search_suggestions.fulfilled, (state, { payload }) => {
                state.suggestions = payload.suggestions || [];
            })
            .addCase(get_search_history.fulfilled, (state, { payload }) => {
                state.searchHistory = payload.history || [];
            })
            .addCase(get_trending_data.fulfilled, (state, { payload }) => {
                state.trendingQueries = payload.trendingQueries || [];
                state.trendingProducts = payload.trendingProducts || [];
            })
            .addCase(get_top_rated_products.fulfilled, (state, { payload }) => {
                state.topRatedProducts = payload.products || [];
            })
            .addCase(get_delivery_estimate.fulfilled, (state, { payload }) => {
                state.deliveryInfo = payload;
            })
            .addCase(get_related_products.fulfilled, (state, { payload }) => {
                state.relatedProducts = payload.related || [];
            })
            .addCase(get_similar_products.fulfilled, (state, { payload }) => {
                state.similarProducts = payload.similar || [];
            })
            .addCase(get_product_social_stats.fulfilled, (state, { payload }) => {
                state.socialStats = payload.stats || {};
            })
            .addCase(get_recent_products.fulfilled, (state, { payload }) => {
                state.recentProducts = payload.products || [];
            });
    }
});

export const { messageClear, reset_product_details, reset_wear_products } = wearProductSlice.actions;
export default wearProductSlice.reducer;
