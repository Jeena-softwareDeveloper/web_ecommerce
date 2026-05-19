import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export const get_active_offers = createAsyncThunk(
    'vendorOffer/get_active_offers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/wear/offers/campaign/active');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const get_global_offers = createAsyncThunk(
    'vendorOffer/get_global_offers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/wear/offers/active');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const vendorOfferReducer = createSlice({
    name: 'vendorOffer',
    initialState: {
        offers: [],
        globalOffers: [],
        notifications: [],
        campaignProducts: [],
        loader: false,
        unreadCount: 0,
        successMessage: '',
        errorMessage: ''
    },
    reducers: {
        clear_message: (state) => {
            state.successMessage = '';
            state.errorMessage = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_active_offers.pending, (state) => { state.loader = true; })
            .addCase(get_active_offers.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.offers = payload.campaigns || [];
            })
            .addCase(get_active_offers.rejected, (state) => { state.loader = false; })

            .addCase(get_global_offers.fulfilled, (state, { payload }) => {
                state.globalOffers = payload.offers || [];
            });
    }
});

export const { clear_message } = vendorOfferReducer.actions;
export default vendorOfferReducer.reducer;
