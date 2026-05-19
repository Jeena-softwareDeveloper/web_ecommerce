import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_profile = createAsyncThunk(
    'profile/get_profile',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/auth/profile');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_profile = createAsyncThunk(
    'profile/update_profile',
    async (profileData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put('/wear/auth/update-profile', profileData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const profile_image_upload = createAsyncThunk(
    'profile/profile_image_upload',
    async (formData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/auth/profile-image-upload', formData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_wallet = createAsyncThunk(
    'profile/get_wallet',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/user/wallet');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_notification_settings = createAsyncThunk(
    'profile/get_notification_settings',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/user/notification-settings');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_notification_settings = createAsyncThunk(
    'profile/update_notification_settings',
    async (settings, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put('/wear/user/notification-settings', settings);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        loader: false,
        profileInfo: null,
        walletData: {
            balance: 0,
            cashback: 0,
            referralBonus: 0,
            history: []
        },
        notificationSettings: {
            orderUpdates: true,
            promotions: true,
            pushNotifications: true,
            whatsappNotifications: true,
            emailNotifications: true
        },
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
            .addCase(get_profile.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_profile.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.profileInfo = payload.userInfo;
            })
            .addCase(get_profile.rejected, (state) => {
                state.loader = false;
            })
            .addCase(get_wallet.fulfilled, (state, { payload }) => {
                state.walletData = payload;
            })
            .addCase(update_profile.pending, (state) => {
                state.loader = true;
            })
            .addCase(update_profile.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.profileInfo = payload.userInfo || payload.user;
                state.successMessage = payload.message || 'Profile updated';
            })
            .addCase(update_profile.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message || payload.error || 'Update failed';
            })
            .addCase(profile_image_upload.pending, (state) => {
                state.loader = true;
            })
            .addCase(profile_image_upload.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.profileInfo = { ...state.profileInfo, image: payload.image };
                state.successMessage = payload.message || 'Image updated';
            })
            .addCase(profile_image_upload.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.message || payload.error || 'Upload failed';
            })
            .addCase(get_notification_settings.fulfilled, (state, { payload }) => {
                state.notificationSettings = payload.settings;
            })
            .addCase(update_notification_settings.fulfilled, (state, { payload }) => {
                state.notificationSettings = payload.settings;
                state.successMessage = 'Notification settings updated';
            });
    }
});

export const { messageClear } = profileSlice.actions;
export default profileSlice.reducer;
