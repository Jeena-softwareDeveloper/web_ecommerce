import axios from 'axios';
import { storage } from '../utils/storage';
import { toast } from 'sonner';

// Base API URL from environment or default
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.jeenora.com/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = storage.getRefreshToken();
                const deviceId = storage.getDeviceId();

                if (refreshToken && deviceId) {
                    const refreshResponse = await axios.post(`${BASE_URL}/wear/auth/refresh-token`, {
                        refreshToken,
                        deviceId
                    });

                    if (refreshResponse.data && refreshResponse.data.accessToken) {
                        const newToken = refreshResponse.data.accessToken;
                        storage.setToken(newToken);
                        if (refreshResponse.data.refreshToken) {
                            storage.setRefreshToken(refreshResponse.data.refreshToken);
                        }

                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                storage.removeToken();
                storage.removeRefreshToken();
                storage.removeUserInfo();
                return Promise.reject(refreshError);
            }
        }

        // Show toast notification for errors (except 401 which might be retried or handled)
        if (error.response?.status !== 401) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
