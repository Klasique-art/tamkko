import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';

export type SubscriptionStatus = 'pending' | 'active' | 'failed' | 'cancelled';

export const subscriptionService = {
    async subscribe(creatorId: string, payload: { amount: number; phoneNumber: string }) {
        const response = await client.post<ApiSuccessResponse<{ subscriptionId: string; status: SubscriptionStatus }>>(
            `/creators/${creatorId}/subscribe`,
            payload
        );
        return response.data.data;
    },

    async getSubscriptionStatus(creatorId: string, subscriptionId: string) {
        const response = await client.get<ApiSuccessResponse<{ status: SubscriptionStatus }>>(
            `/creators/${creatorId}/subscribe/${subscriptionId}/status`
        );
        return response.data.data;
    },

    async getActiveSubscriptions() {
        const response = await client.get<ApiSuccessResponse<Array<{ creatorId: string; creatorUsername: string }>>>('/subscriptions');
        return response.data.data;
    },

    async cancelSubscription(creatorId: string) {
        await client.delete(`/creators/${creatorId}/subscribe`);
    },
};
