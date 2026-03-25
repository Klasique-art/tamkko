import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { WalletSummary, WalletTransaction } from '@/types/wallet.types';

export const walletService = {
    async getSummary(): Promise<WalletSummary> {
        const response = await client.get<ApiSuccessResponse<WalletSummary>>('/wallet');
        return response.data.data;
    },

    async getTransactions(): Promise<WalletTransaction[]> {
        const response = await client.get<ApiSuccessResponse<WalletTransaction[]>>('/wallet/transactions');
        return response.data.data;
    },

    async getEarningsByVideo(): Promise<Array<{ videoId: string; amount: number }>> {
        const response = await client.get<ApiSuccessResponse<Array<{ videoId: string; amount: number }>>>(
            '/wallet/earnings/by-video'
        );
        return response.data.data;
    },
};
