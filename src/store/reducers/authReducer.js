import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";
import { storage } from "../../utils/storage";

export const send_otp = createAsyncThunk(
    'auth/send_otp',
    async (phone, { rejectWithValue, fulfillWithValue }) => {
        try {
            const deviceId = storage.getDeviceId();
            const response = await apiClient.post('/wear/auth/send-otp', { phone, deviceId });
            const result = response.data;

            if (result.accessToken) {
                storage.setToken(result.accessToken);
                storage.setRefreshToken(result.refreshToken);
                storage.setUserInfo(result.userInfo);
            }

            return fulfillWithValue(result);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const verify_otp = createAsyncThunk(
    'auth/verify_otp',
    async (data, { rejectWithValue, fulfillWithValue }) => {
        try {
            const deviceId = storage.getDeviceId();
            const response = await apiClient.post('/wear/auth/verify-otp', {
                phone: data.phone,
                otp: data.otp,
                deviceId
            });
            const result = response.data;

            if (result.accessToken) {
                storage.setToken(result.accessToken);
                storage.setRefreshToken(result.refreshToken);
                storage.setUserInfo(result.userInfo);
            }
            return fulfillWithValue(result);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const firebase_login = createAsyncThunk(
    'auth/firebase_login',
    async (data, { rejectWithValue, fulfillWithValue }) => {
        try {
            const deviceId = storage.getDeviceId();
            const response = await apiClient.post('/auth/firebase-phone-login', {
                ...data,
                deviceId
            });
            const result = response.data;

            if (result.token) {
                storage.setToken(result.token);
                storage.setRefreshToken(result.refreshToken);
                storage.setUserInfo(result.userInfo);
            }
            return fulfillWithValue(result);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const check_auth = createAsyncThunk(
    'auth/check_auth',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const userInfo = storage.getUserInfo();
            const token = storage.getToken();
            if (token && userInfo) {
                return fulfillWithValue({ userInfo, token });
            }
            return rejectWithValue('No session found');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const register_user = createAsyncThunk(
    'auth/register_user',
    async (data, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/auth/register', data);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const login_user = createAsyncThunk(
    'auth/login_user',
    async (data, { rejectWithValue, fulfillWithValue }) => {
        try {
            const deviceId = storage.getDeviceId();
            const response = await apiClient.post('/wear/auth/login', { ...data, deviceId });
            const result = response.data;

            if (result.accessToken) {
                storage.setToken(result.accessToken);
                storage.setRefreshToken(result.refreshToken);
                storage.setUserInfo(result.userInfo);
            }
            return fulfillWithValue(result);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const logout_user = createAsyncThunk(
    'auth/logout_user',
    async (_, { fulfillWithValue }) => {
        try {
            const deviceId = storage.getDeviceId();
            await apiClient.post('/wear/auth/logout', { deviceId });
        } catch (error) {
            // Ignore error on logout
        } finally {
            storage.removeToken();
            storage.removeRefreshToken();
            storage.removeUserInfo();
        }
        return fulfillWithValue({ success: true });
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: null,
        token: '',
        hasCheckedAuth: false,
        isGuest: false
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        user_logout: (state) => {
            state.userInfo = null;
            state.token = "";
            state.isGuest = false;
        },
        set_guest: (state, { payload }) => {
            state.isGuest = payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(verify_otp.pending, (state) => {
                state.loader = true;
            })
            .addCase(verify_otp.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Login Success';
                state.userInfo = payload.userInfo;
                state.token = payload.accessToken;
            })
            .addCase(verify_otp.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = typeof payload === 'string' ? payload : (payload?.message || 'Login Failed');
            })
            .addCase(firebase_login.pending, (state) => {
                state.loader = true;
            })
            .addCase(firebase_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Login Success';
                state.userInfo = payload.userInfo;
                state.token = payload.token;
            })
            .addCase(firebase_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = typeof payload === 'string' ? payload : (payload?.message || 'Login Failed');
            })
            .addCase(check_auth.fulfilled, (state, { payload }) => {
                state.userInfo = payload.userInfo;
                state.token = payload.token;
                state.hasCheckedAuth = true;
            })
            .addCase(check_auth.rejected, (state) => {
                state.hasCheckedAuth = true;
            })
            .addCase(send_otp.pending, (state) => {
                state.loader = true;
            })
            .addCase(send_otp.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'OTP Sent successfully';
                if (payload.accessToken) {
                    state.userInfo = payload.userInfo;
                    state.token = payload.accessToken;
                }
                if (payload.otp) {
                    state.successMessage += ` (Code: ${payload.otp})`;
                }
            })
            .addCase(send_otp.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = typeof payload === 'string' ? payload : (payload?.message || 'Failed to send OTP');
            })
            .addCase(logout_user.fulfilled, (state) => {
                state.userInfo = null;
                state.token = "";
            })
            .addCase(register_user.pending, (state) => {
                state.loader = true;
            })
            .addCase(register_user.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(register_user.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = typeof payload === 'string' ? payload : (payload?.error || payload?.message || 'Registration failed');
            })
            .addCase(login_user.pending, (state) => {
                state.loader = true;
            })
            .addCase(login_user.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Login Success';
                state.userInfo = payload.userInfo;
                state.token = payload.accessToken;
            })
            .addCase(login_user.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = typeof payload === 'string' ? payload : (payload?.error || payload?.message || 'Login failed');
            });
    }
});

export const { messageClear, user_logout, set_guest } = authSlice.actions;
export default authSlice.reducer;
