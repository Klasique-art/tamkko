import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { WithdrawalRequest } from '@/types/wallet.types';

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';

export const withdrawalService = {
    async initiateWithdrawal(payload: WithdrawalRequest) {
        const response = await client.post<ApiSuccessResponse<{ withdrawalId: string; status: WithdrawalStatus }>>(
            '/wallet/withdraw',
            payload
        );
        return response.data.data;
    },

    async getWithdrawalStatus(withdrawalId: string) {
        const response = await client.get<ApiSuccessResponse<{ withdrawalId: string; status: WithdrawalStatus }>>(
            `/wallet/withdrawals/${withdrawalId}/status`
        );
        return response.data.data;
    },

    async getWithdrawalHistory() {
        const response = await client.get<ApiSuccessResponse<Array<{ withdrawalId: string; amount: number; status: WithdrawalStatus }>>>(
            '/wallet/withdrawals'
        );
        return response.data.data;
    },
};
