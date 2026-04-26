import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchMenuItems = createAsyncThunk(
    'menu/fetchMenuItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/menu-items`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        menuItems: [],
        loader: false,
        errorMessage: '',
        successMessage: ''
    },
    reducers: {
        clearMessages: (state) => {
            state.errorMessage = '';
            state.successMessage = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenuItems.pending, (state) => {
                state.loader = true;
            })
            .addCase(fetchMenuItems.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.menuItems = payload.menuItems;
            })
            .addCase(fetchMenuItems.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            });
    }
});

export const { clearMessages } = menuSlice.actions;
export default menuSlice.reducer;
