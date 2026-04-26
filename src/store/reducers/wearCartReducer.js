import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_cart = createAsyncThunk(
    'wearCart/get_cart',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/cart/get');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const add_to_cart = createAsyncThunk(
    'wearCart/add_to_cart',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/cart/add', info);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const remove_from_cart = createAsyncThunk(
    'wearCart/remove_from_cart',
    async (cartId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.delete(`/wear/cart/remove/${cartId}`);
            return fulfillWithValue({ ...response.data, cartId });
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_cart_quantity = createAsyncThunk(
    'wearCart/update_cart_quantity',
    async ({ cartId, quantity }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/cart/update-quantity', { cartId, quantity });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const wearCartSlice = createSlice({
    name: 'wearCart',
    initialState: {
        loader: false,
        cartItems: [],
        totalItems: 0,
        totalPrice: 0,
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
            .addCase(get_cart.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_cart.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.cartItems = payload.cartItems || [];
                state.totalItems = payload.totalItems !== undefined ? payload.totalItems : (payload.cartItems?.length || 0);
                state.totalPrice = payload.buy_product_price || 0;
            })
            .addCase(get_cart.rejected, (state) => {
                state.loader = false;
            })
            .addCase(add_to_cart.pending, (state) => {
                state.loader = true;
            })
            .addCase(add_to_cart.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(add_to_cart.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.message || 'Failed to add to cart';
            })
            .addCase(remove_from_cart.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.cartItems = state.cartItems.filter(i => i._id !== payload.cartId);
                state.totalItems = state.cartItems.length;
            })
            .addCase(update_cart_quantity.pending, (state) => {
                state.loader = true;
            })
            .addCase(update_cart_quantity.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                const index = state.cartItems.findIndex(i => i._id === payload.cart?._id);
                if (index !== -1) {
                    state.cartItems[index] = payload.cart;
                }
            })
            .addCase(update_cart_quantity.rejected, (state) => {
                state.loader = false;
            });
    }
});

export const { messageClear } = wearCartSlice.actions;
export default wearCartSlice.reducer;
