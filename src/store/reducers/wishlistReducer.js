import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";
import { toast } from "sonner";

export const get_wishlist = createAsyncThunk(
    'wishlist/get_wishlist',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/wishlist/get');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const add_to_wishlist = createAsyncThunk(
    'wishlist/add_to_wishlist',
    async (productId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/wishlist/add', { productId });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const remove_from_wishlist = createAsyncThunk(
    'wishlist/remove_from_wishlist',
    async (productId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.delete(`/wear/wishlist/remove/${productId}`);
            return fulfillWithValue({ ...response.data, productId });
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const toggle_wishlist = createAsyncThunk(
    'wishlist/toggle_wishlist',
    async ({ productId, isInWishlist }, { dispatch, rejectWithValue }) => {
        try {
            if (isInWishlist) {
                await dispatch(remove_from_wishlist(productId));
                toast.success('Removed from wishlist');
            } else {
                await dispatch(add_to_wishlist(productId));
                toast.success('Added to wishlist');
            }
            return fulfillWithValue({ productId, isInWishlist: !isInWishlist });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update wishlist');
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        loader: false,
        wishlistItems: [],
        successMessage: '',
        errorMessage: ''
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        clearWishlist: (state) => {
            state.wishlistItems = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_wishlist.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_wishlist.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.wishlistItems = payload.wishlist || [];
            })
            .addCase(get_wishlist.rejected, (state) => {
                state.loader = false;
                state.wishlistItems = [];
            })
            .addCase(add_to_wishlist.pending, (state) => {
                state.loader = true;
            })
            .addCase(add_to_wishlist.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.wishlistItems = payload.wishlist || [];
                state.successMessage = payload.message || 'Added to wishlist';
            })
            .addCase(add_to_wishlist.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to add to wishlist';
            })
            .addCase(remove_from_wishlist.pending, (state) => {
                state.loader = true;
            })
            .addCase(remove_from_wishlist.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.wishlistItems = payload.wishlist || [];
                state.successMessage = payload.message || 'Removed from wishlist';
            })
            .addCase(remove_from_wishlist.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to remove from wishlist';
            });
    }
});

export const { messageClear, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
