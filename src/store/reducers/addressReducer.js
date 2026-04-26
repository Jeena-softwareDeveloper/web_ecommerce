import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

export const get_addresses = createAsyncThunk(
    'address/get_addresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/user/addresses');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const add_address = createAsyncThunk(
    'address/add_address',
    async (info, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/user/addresses', info);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const delete_address = createAsyncThunk(
    'address/delete_address',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.delete(`/user/addresses/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const update_address = createAsyncThunk(
    'address/update_address',
    async ({ id, info }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/user/addresses/${id}`, info);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const addressReducer = createSlice({
    name: 'address',
    initialState: {
        addresses: [],
        loader: false,
        errorMessage: '',
        successMessage: ''
    },
    reducers: {
        clear_message: (state) => {
            state.errorMessage = '';
            state.successMessage = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_addresses.pending, (state) => { state.loader = true; })
            .addCase(get_addresses.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.addresses = payload.addresses || [];
            })
            .addCase(get_addresses.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to fetch addresses';
            })
            .addCase(add_address.pending, (state) => { state.loader = true; })
            .addCase(add_address.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Address added successful';
                state.addresses = [payload.address, ...state.addresses];
            })
            .addCase(add_address.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to add address';
            })
            .addCase(delete_address.fulfilled, (state, { payload }) => {
                state.addresses = state.addresses.filter(a => a._id !== payload.addressId);
            })
            .addCase(update_address.pending, (state) => { state.loader = true; })
            .addCase(update_address.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Address updated successful';
                state.addresses = state.addresses.map(a => a._id === payload.address?._id ? payload.address : a);
            })
            .addCase(update_address.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to update address';
            });
    }
});

export const { clear_message } = addressReducer.actions;
export default addressReducer.reducer;
