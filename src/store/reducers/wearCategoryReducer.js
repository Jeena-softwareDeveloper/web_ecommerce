import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_wear_categories = createAsyncThunk(
    'wearCategory/get_wear_categories',
    async (params, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/home/get-gategorys', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const wearCategorySlice = createSlice({
    name: 'wearCategory',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        categories: [],
        totalCategories: 0,
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_wear_categories.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_wear_categories.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.categories = payload.categories || [];
                state.totalCategories = payload.totalCategories || 0;
            })
            .addCase(get_wear_categories.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to fetch categories';
            });
    }
});

export const { messageClear } = wearCategorySlice.actions;
export default wearCategorySlice.reducer;
