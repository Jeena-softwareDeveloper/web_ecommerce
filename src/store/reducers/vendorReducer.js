import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const get_supplier_status = createAsyncThunk(
    'vendor/get_supplier_status',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/status');
            return fulfillWithValue(response.data);
        } catch (error) {
            if (error.response?.status === 404 || error.response?.status === 400) {
                return fulfillWithValue({ success: true, data: { status: 'none' } });
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_supplier_dashboard_stats = createAsyncThunk(
    'vendor/get_supplier_dashboard_stats',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/dashboard-stats');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_my_catalogs = createAsyncThunk(
    'vendor/get_my_catalogs',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/catalog/my-list');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_catalog_status = createAsyncThunk(
    'vendor/update_catalog_status',
    async ({ productId, status }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.patch(`/wear/supplier/catalog/status/${productId}`, { status });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_supplier_orders = createAsyncThunk(
    'vendor/get_supplier_orders',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/orders');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_order_status = createAsyncThunk(
    'vendor/update_order_status',
    async ({ orderId, status }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/order-status/${orderId}`, { status });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const apply_supplier = createAsyncThunk(
    'vendor/apply_supplier',
    async (businessData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/apply', businessData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const add_catalog = createAsyncThunk(
    'vendor/add_catalog',
    async (payload, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/catalog/add', payload);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const edit_catalog = createAsyncThunk(
    'vendor/edit_catalog',
    async ({ catalogId, products, catalogInfo }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/catalog/supplier-edit/${catalogId}`, { products, catalogInfo });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_catalog_for_edit = createAsyncThunk(
    'vendor/get_catalog_for_edit',
    async (catalogId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/supplier/catalog/${catalogId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== RETURNS & RTO MANAGEMENT ====================
export const get_supplier_returns_v2 = createAsyncThunk(
    'vendor/get_supplier_returns_v2',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/returns/v2');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_return_details = createAsyncThunk(
    'vendor/get_return_details',
    async (returnId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/supplier/returns/${returnId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_return_qc = createAsyncThunk(
    'vendor/update_return_qc',
    async ({ returnId, qcStatus, notes }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/returns/${returnId}/qc`, { qcStatus, notes });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_return_status = createAsyncThunk(
    'vendor/update_return_status',
    async ({ returnId, status, notes }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/returns/${returnId}/status`, { status, notes });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_supplier_rtos = createAsyncThunk(
    'vendor/get_supplier_rtos',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/rtos');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_rto_details = createAsyncThunk(
    'vendor/get_rto_details',
    async (rtoId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/supplier/rtos/${rtoId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const acknowledge_rto_receipt = createAsyncThunk(
    'vendor/acknowledge_rto_receipt',
    async (rtoId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post(`/wear/supplier/rtos/${rtoId}/acknowledge`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_rto_qc = createAsyncThunk(
    'vendor/update_rto_qc',
    async ({ rtoId, qcStatus, notes }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/rtos/${rtoId}/qc`, { qcStatus, notes });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_rto_status = createAsyncThunk(
    'vendor/update_rto_status',
    async ({ rtoId, status, notes }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/rtos/${rtoId}/status`, { status, notes });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_return_stats = createAsyncThunk(
    'vendor/get_return_stats',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/returns-stats/dashboard');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_rto_stats = createAsyncThunk(
    'vendor/get_rto_stats',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/rtos-stats/dashboard');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_combined_returns_rtos_stats = createAsyncThunk(
    'vendor/get_combined_returns_rtos_stats',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/returns-rtos/combined-stats');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== SETTLEMENT & PAYOUT MANAGEMENT ====================
export const calculate_settlement = createAsyncThunk(
    'vendor/calculate_settlement',
    async ({ startDate, endDate }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/settlements/calculate', { startDate, endDate });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const generate_settlement_statement = createAsyncThunk(
    'vendor/generate_settlement_statement',
    async ({ settlementId, format = 'pdf' }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/settlements/generate-statement', { settlementId, format });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_settlement_history = createAsyncThunk(
    'vendor/get_settlement_history',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/settlements/history');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_payout_details = createAsyncThunk(
    'vendor/get_payout_details',
    async (payoutId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/supplier/settlements/payout/${payoutId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const request_payout = createAsyncThunk(
    'vendor/request_payout',
    async ({ amount, paymentMethod }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/settlements/request-payout', { amount, paymentMethod });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_financial_dashboard = createAsyncThunk(
    'vendor/get_financial_dashboard',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/settlements/financial-dashboard');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== CATALOG MAINTENANCE & SYNC ====================
export const get_catalog_sync_status = createAsyncThunk(
    'vendor/get_catalog_sync_status',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/catalog/sync-status');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const sync_catalog = createAsyncThunk(
    'vendor/sync_catalog',
    async ({ syncType = 'full', force = false }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/catalog/sync', { syncType, force });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const bulk_update_catalog = createAsyncThunk(
    'vendor/bulk_update_catalog',
    async ({ updates, operation }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/catalog/bulk-update', { updates, operation });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_catalog_analytics = createAsyncThunk(
    'vendor/get_catalog_analytics',
    async ({ period = 'month', startDate, endDate }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const params = { period };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/wear/supplier/catalog/analytics', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const export_catalog_data = createAsyncThunk(
    'vendor/export_catalog_data',
    async ({ format = 'json', include = 'all' }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/catalog/export', { 
                params: { format, include },
                responseType: 'blob'
            });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const import_catalog_data = createAsyncThunk(
    'vendor/import_catalog_data',
    async ({ data, format = 'json', action = 'validate' }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/catalog/import', { data, format, action });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== SUPPORT & COMMUNICATION ====================
export const create_support_ticket = createAsyncThunk(
    'vendor/create_support_ticket',
    async ({ type, subject, description, priority = 'medium', attachments = [], orderId, productId }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/support/tickets', { 
                type, subject, description, priority, attachments, orderId, productId 
            });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_support_tickets = createAsyncThunk(
    'vendor/get_support_tickets',
    async ({ page = 1, limit = 20, status, type, priority, startDate, endDate }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const params = { page, limit };
            if (status) params.status = status;
            if (type) params.type = type;
            if (priority) params.priority = priority;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/wear/supplier/support/tickets', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_ticket_details = createAsyncThunk(
    'vendor/get_ticket_details',
    async (ticketId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get(`/wear/supplier/support/tickets/${ticketId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const add_ticket_message = createAsyncThunk(
    'vendor/add_ticket_message',
    async ({ ticketId, message, attachments = [] }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post(`/wear/supplier/support/tickets/${ticketId}/messages`, { message, attachments });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const close_support_ticket = createAsyncThunk(
    'vendor/close_support_ticket',
    async ({ ticketId, resolutionNotes, satisfactionRating }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post(`/wear/supplier/support/tickets/${ticketId}/close`, { resolutionNotes, satisfactionRating });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_notifications = createAsyncThunk(
    'vendor/get_notifications',
    async ({ page = 1, limit = 50, type, read, startDate, endDate }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const params = { page, limit };
            if (type) params.type = type;
            if (read !== undefined) params.read = read;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/wear/supplier/notifications', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const mark_notification_read = createAsyncThunk(
    'vendor/mark_notification_read',
    async (notificationId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put(`/wear/supplier/notifications/${notificationId}/read`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const mark_all_notifications_read = createAsyncThunk(
    'vendor/mark_all_notifications_read',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put('/wear/supplier/notifications/read-all');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_communication_preferences = createAsyncThunk(
    'vendor/get_communication_preferences',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/communication/preferences');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_communication_preferences = createAsyncThunk(
    'vendor/update_communication_preferences',
    async (preferences, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put('/wear/supplier/communication/preferences', preferences);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== SECURITY & SESSION MANAGEMENT ====================
export const get_active_sessions = createAsyncThunk(
    'vendor/get_active_sessions',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/security/sessions');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const terminate_session = createAsyncThunk(
    'vendor/terminate_session',
    async (sessionId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.delete(`/wear/supplier/security/sessions/${sessionId}`);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const terminate_all_other_sessions = createAsyncThunk(
    'vendor/terminate_all_other_sessions',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.delete('/wear/supplier/security/sessions/terminate-others');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const change_password = createAsyncThunk(
    'vendor/change_password',
    async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/security/change-password', { 
                currentPassword, newPassword, confirmPassword 
            });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_password_strength = createAsyncThunk(
    'vendor/get_password_strength',
    async (password, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/security/password-strength', { 
                params: { password } 
            });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_2fa_status = createAsyncThunk(
    'vendor/get_2fa_status',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/security/2fa/status');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const enable_2fa = createAsyncThunk(
    'vendor/enable_2fa',
    async ({ method = 'authenticator', phoneNumber, email }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/security/2fa/enable', { 
                method, phoneNumber, email 
            });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const disable_2fa = createAsyncThunk(
    'vendor/disable_2fa',
    async ({ verificationCode }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/security/2fa/disable', { verificationCode });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_login_activity = createAsyncThunk(
    'vendor/get_login_activity',
    async ({ page = 1, limit = 50, startDate, endDate }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const params = { page, limit };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/wear/supplier/security/login-activity', { params });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const get_security_settings = createAsyncThunk(
    'vendor/get_security_settings',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/security/settings');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_security_settings = createAsyncThunk(
    'vendor/update_security_settings',
    async (settings, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put('/wear/supplier/security/settings', settings);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== PRICING MANAGEMENT ====================
export const get_pricing_data = createAsyncThunk(
    'vendor/get_pricing_data',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/pricing/data');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const update_product_price = createAsyncThunk(
    'vendor/update_product_price',
    async ({ productId, newPrice }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.put('/wear/supplier/pricing/update-price', { productId, newPrice });
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== WAREHOUSE MANAGEMENT ====================
export const get_warehouse_data = createAsyncThunk(
    'vendor/get_warehouse_data',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/warehouse/data');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== PROMOTIONS MANAGEMENT ====================
export const get_promotions_data = createAsyncThunk(
    'vendor/get_promotions_data',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/promotions/data');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const create_promotion = createAsyncThunk(
    'vendor/create_promotion',
    async (promotionData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.post('/wear/supplier/promotions/create', promotionData);
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== OFFER ZONE MANAGEMENT ====================
export const get_offer_zone_data = createAsyncThunk(
    'vendor/get_offer_zone_data',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/offer-zone/data');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== PRICE RECOMMENDATION ====================
export const get_price_recommendations = createAsyncThunk(
    'vendor/get_price_recommendations',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/price-recommendations');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ==================== QUALITY DASHBOARD ====================
export const get_quality_dashboard_data = createAsyncThunk(
    'vendor/get_quality_dashboard_data',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const response = await apiClient.get('/wear/supplier/quality-dashboard/data');
            return fulfillWithValue(response.data);
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const vendorSlice = createSlice({
    name: 'vendor',
    initialState: {
        loader: false,
        supplierStatus: 'loading',
        supplierData: null,
        stats: null,
        myCatalogs: [],
        payouts: [],
        returns: [],
        supplierOrders: [],
        supplierOrderDetail: null,
        successMessage: '',
        errorMessage: '',
        
        // Returns & RTO Management
        returnsV2: [],
        returnDetails: null,
        rtos: [],
        rtoDetails: null,
        returnStats: null,
        rtoStats: null,
        combinedReturnsRtosStats: null,
        
        // Settlement & Payout
        settlementCalculation: null,
        settlementStatement: null,
        settlementHistory: [],
        payoutDetails: null,
        financialDashboard: null,
        
        // Catalog Maintenance
        catalogSyncStatus: null,
        catalogAnalytics: null,
        catalogExportData: null,
        catalogImportResult: null,
        
        // Support & Communication
        supportTickets: [],
        ticketDetails: null,
        notifications: [],
        notificationSummary: { total: 0, unread: 0, read: 0 },
        communicationPreferences: null,
        
        // Security & Session Management
        activeSessions: [],
        loginActivity: [],
        passwordStrength: null,
        twoFactorStatus: null,
        securitySettings: null,
        
        // Modules Data
        warehouseData: null,
        pricingData: null,
        promotionsData: null,
        offerZoneData: null,
        qualityDashboardData: null,
        priceRecommendations: []
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_supplier_status.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_supplier_status.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.supplierStatus = payload.data?.status || 'none';
                state.supplierData = payload.data;
            })
            .addCase(get_supplier_status.rejected, (state) => {
                state.loader = false;
                state.supplierStatus = 'none';
            })
            .addCase(get_supplier_dashboard_stats.fulfilled, (state, { payload }) => {
                state.stats = payload.stats;
                state.supplierStatus = payload.status;
                state.supplierData = { ...state.supplierData, shopName: payload.shopName };
            })
            .addCase(get_my_catalogs.fulfilled, (state, { payload }) => {
                state.myCatalogs = payload.catalogs;
            })
            .addCase(get_supplier_orders.fulfilled, (state, { payload }) => {
                state.supplierOrders = payload.orders || [];
            })
            .addCase(update_order_status.fulfilled, (state, { payload }) => {
                const index = state.supplierOrders.findIndex(o => o._id === payload.orderId);
                if (index !== -1) {
                    state.supplierOrders[index].delivery_status = payload.status;
                }
                state.successMessage = payload.message;
            })
            .addCase(update_catalog_status.fulfilled, (state, { payload }) => {
                const index = state.myCatalogs.findIndex(c => c._id === payload.productId);
                if (index !== -1) {
                    state.myCatalogs[index].status = payload.status;
                }
                state.successMessage = payload.message;
            })
            .addCase(apply_supplier.pending, (state) => {
                state.loader = true;
            })
            .addCase(apply_supplier.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Application submitted successfully';
                state.supplierStatus = 'pending';
                state.supplierData = payload.data;
            })
            .addCase(apply_supplier.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to submit application';
            })
            .addCase(add_catalog.pending, (state) => {
                state.loader = true;
            })
            .addCase(add_catalog.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Catalog added successfully';
            })
            .addCase(add_catalog.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to add catalog';
            })
            .addCase(edit_catalog.pending, (state) => {
                state.loader = true;
            })
            .addCase(edit_catalog.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message || 'Catalog updated and submitted for review';
            })
            .addCase(edit_catalog.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Failed to update catalog';
            })
            
            // Returns & RTO Management
            .addCase(get_supplier_returns_v2.fulfilled, (state, { payload }) => {
                state.returnsV2 = payload.returns || [];
            })
            .addCase(get_return_details.fulfilled, (state, { payload }) => {
                state.returnDetails = payload.return;
            })
            .addCase(get_supplier_rtos.fulfilled, (state, { payload }) => {
                state.rtos = payload.rtos || [];
            })
            .addCase(get_rto_details.fulfilled, (state, { payload }) => {
                state.rtoDetails = payload.rto;
            })
            .addCase(get_return_stats.fulfilled, (state, { payload }) => {
                state.returnStats = payload.stats;
            })
            .addCase(get_rto_stats.fulfilled, (state, { payload }) => {
                state.rtoStats = payload.stats;
            })
            .addCase(get_combined_returns_rtos_stats.fulfilled, (state, { payload }) => {
                state.combinedReturnsRtosStats = payload.stats;
            })
            
            // Settlement & Payout
            .addCase(calculate_settlement.fulfilled, (state, { payload }) => {
                state.settlementCalculation = payload.calculation;
            })
            .addCase(generate_settlement_statement.fulfilled, (state, { payload }) => {
                state.settlementStatement = payload.statement;
            })
            .addCase(get_settlement_history.fulfilled, (state, { payload }) => {
                state.settlementHistory = payload.settlements || [];
            })
            .addCase(get_payout_details.fulfilled, (state, { payload }) => {
                state.payoutDetails = payload.payout;
            })
            .addCase(get_financial_dashboard.fulfilled, (state, { payload }) => {
                state.financialDashboard = payload.dashboard;
            })
            
            // Catalog Maintenance
            .addCase(get_catalog_sync_status.fulfilled, (state, { payload }) => {
                state.catalogSyncStatus = payload.status;
            })
            .addCase(get_catalog_analytics.fulfilled, (state, { payload }) => {
                state.catalogAnalytics = payload.analytics;
            })
            .addCase(export_catalog_data.fulfilled, (state, { payload }) => {
                state.catalogExportData = payload.data;
            })
            .addCase(import_catalog_data.fulfilled, (state, { payload }) => {
                state.catalogImportResult = payload.result;
            })
            
            // Support & Communication
            .addCase(get_support_tickets.fulfilled, (state, { payload }) => {
                state.supportTickets = payload.tickets || [];
            })
            .addCase(get_ticket_details.fulfilled, (state, { payload }) => {
                state.ticketDetails = payload.ticket;
            })
            .addCase(get_notifications.fulfilled, (state, { payload }) => {
                state.notifications = payload.notifications || [];
                state.notificationSummary = payload.summary || { total: 0, unread: 0, read: 0 };
            })
            .addCase(get_communication_preferences.fulfilled, (state, { payload }) => {
                state.communicationPreferences = payload.preferences;
            })
            
            // Security & Session Management
            .addCase(get_active_sessions.fulfilled, (state, { payload }) => {
                state.activeSessions = payload.sessions || [];
            })
            .addCase(get_login_activity.fulfilled, (state, { payload }) => {
                state.loginActivity = payload.activity || [];
            })
            .addCase(get_password_strength.fulfilled, (state, { payload }) => {
                state.passwordStrength = payload.strength;
            })
            .addCase(get_2fa_status.fulfilled, (state, { payload }) => {
                state.twoFactorStatus = payload.status;
            })
            .addCase(get_security_settings.fulfilled, (state, { payload }) => {
                state.securitySettings = payload.settings;
            })
            
            // Modules Data Fulfilled
            .addCase(get_warehouse_data.fulfilled, (state, { payload }) => {
                state.warehouseData = payload.data;
            })
            .addCase(get_pricing_data.fulfilled, (state, { payload }) => {
                state.pricingData = payload.data;
            })
            .addCase(get_promotions_data.fulfilled, (state, { payload }) => {
                state.promotionsData = payload.data;
            })
            .addCase(get_offer_zone_data.fulfilled, (state, { payload }) => {
                state.offerZoneData = payload.data;
            })
            .addCase(get_price_recommendations.fulfilled, (state, { payload }) => {
                state.priceRecommendations = payload.data?.recommendations || [];
            })
            .addCase(get_quality_dashboard_data.fulfilled, (state, { payload }) => {
                state.qualityDashboardData = payload.data;
            });
    }
});

export const { messageClear } = vendorSlice.actions;
export default vendorSlice.reducer;
