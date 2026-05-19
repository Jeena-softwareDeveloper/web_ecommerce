import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_orders = createAsyncThunk(
    'order/get_orders',
    async ({ userId, status }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/orders/home/customer/get-orders/${userId}/${status || 'all'}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const place_order = createAsyncThunk(
    'order/place_order',
    async (orderData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/orders/home/order/place-order', orderData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const create_cashfree_order = createAsyncThunk(
    'order/create_cashfree_order',
    async (orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/orders/order/cashfree-create-order', { orderId });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const verify_cashfree_payment = createAsyncThunk(
    'order/verify_cashfree_payment',
    async (paymentData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/orders/order/cashfree-verify', paymentData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_order_details = createAsyncThunk(
    'order/get_order_details',
    async (orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/orders/home/customer/get-order-details/${orderId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const cancel_order = createAsyncThunk(
    'order/cancel_order',
    async (orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/orders/home/customer/order-cancel/${orderId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const order_fail = createAsyncThunk(
    'order/order_fail',
    async (orderId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/orders/home/customer/order-fail/${orderId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const orderSlice = createSlice({
    name: 'order',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        orders: [],
        orderDetails: null,
        orderInitiated: null
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        orderReset: (state) => {
            state.orders = [];
            state.orderDetails = null;
            state.orderInitiated = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_orders.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_orders.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.orders = payload.orders || [];
            })
            .addCase(get_orders.rejected, (state) => {
                state.loader = false;
            })
            .addCase(place_order.pending, (state) => {
                state.loader = true;
            })
            .addCase(place_order.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.orderInitiated = payload;
            })
            .addCase(place_order.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to place order';
            })
            .addCase(create_cashfree_order.pending, (state) => {
                state.loader = true;
            })
            .addCase(create_cashfree_order.fulfilled, (state) => {
                state.loader = false;
            })
            .addCase(create_cashfree_order.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.message || 'Failed to create Cashfree order';
            })
            .addCase(verify_cashfree_payment.pending, (state) => {
                state.loader = true;
            })
            .addCase(verify_cashfree_payment.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(verify_cashfree_payment.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.message || 'Cashfree payment verification failed';
            })
            .addCase(get_order_details.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_order_details.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.orderDetails = payload.order;
            })
            .addCase(get_order_details.rejected, (state) => {
                state.loader = false;
            })
            .addCase(cancel_order.pending, (state) => {
                state.loader = true;
            })
            .addCase(cancel_order.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                if (state.orderDetails) {
                    state.orderDetails.delivery_status = 'cancelled';
                }
            })
            .addCase(cancel_order.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message || 'Failed to cancel order';
            })
            .addCase(order_fail.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            });
    }
});

export const { messageClear, orderReset } = orderSlice.actions;
export default orderSlice.reducer;
