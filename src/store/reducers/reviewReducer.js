import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_reviews = createAsyncThunk(
    'review/get_reviews',
    async (catalogId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/review/catalog/${catalogId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const add_review = createAsyncThunk(
    'review/add_review',
    async (reviewData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post(`/wear/review/add`, reviewData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        loader: false,
        reviews: [],
        stats: { avgRating: 0, totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, highlights: [] },
        successMessage: '',
        errorMessage: ''
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_reviews.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_reviews.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.reviews = payload.reviews || [];
                state.stats = payload.stats || state.stats;
            })
            .addCase(get_reviews.rejected, (state) => {
                state.loader = false;
            })
            .addCase(add_review.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message || 'Review added successfully';
            })
            .addCase(add_review.rejected, (state, { payload }) => {
                state.errorMessage = payload?.error || 'Failed to add review';
            });
    }
});

export const { messageClear } = reviewSlice.actions;
export default reviewSlice.reducer;
