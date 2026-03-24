import client from '@/lib/client';
import {
    ApiPaymentMethod,
    CurrentMonthStatusData,
    InitializePaymentResponseData,
    PaymentHistoryItem,
    VerifyPaymentResponseData,
} from '@/types/payment.types';

type ApiEnvelope<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export const paymentService = {
    async getCurrentMonthStatus(): Promise<CurrentMonthStatusData> {
        const response = await client.get<ApiEnvelope<CurrentMonthStatusData>>('/payments/current-month/status/');
        return response.data.data;
    },

    async getPaymentMethods(): Promise<ApiPaymentMethod[]> {
        const response = await client.get<ApiEnvelope<{ payment_methods: ApiPaymentMethod[] }>>('/payments/methods/user/');
        return response.data.data.payment_methods ?? [];
    },

    async setDefaultPaymentMethod(id: number): Promise<void> {
        await client.put(`/payments/methods/${id}/default/`);
    },

    async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
        const response = await client.get<ApiEnvelope<{ payments: PaymentHistoryItem[] }>>('/payments/history/');
        return response.data.data.payments ?? [];
    },

    async initializeMonthlyPayment(payload: {
        payment_method_id?: number;
        auto_renew?: boolean;
        month?: string;
        callback_url?: string;
        currency?: string;
        allow_currency_fallback?: boolean;
    }): Promise<InitializePaymentResponseData> {
        const response = await client.post<ApiEnvelope<InitializePaymentResponseData>>(
            '/payments/monthly/initialize/',
            payload
        );
        return response.data.data;
    },

    async verifyPayment(reference: string): Promise<VerifyPaymentResponseData> {
        const response = await client.get<ApiEnvelope<VerifyPaymentResponseData>>(`/payments/verify/${reference}/`);
        return response.data.data;
    },

    async updateAutoRenew(payload?: { auto_renew?: boolean }): Promise<{ auto_renew: boolean }> {
        const response = await client.put<ApiEnvelope<{ auto_renew: boolean }>>('/payments/auto-renew/', payload ?? {});
        return response.data.data;
    },
};
