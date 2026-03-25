import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';

export type TipStatus = 'pending' | 'completed' | 'failed';

export const tipService = {
    async initiateTip(payload: { videoId: string; creatorId: string; amount: number; phoneNumber: string }) {
        const response = await client.post<ApiSuccessResponse<{ tipId: string; status: TipStatus }>>('/tips', payload);
        return response.data.data;
    },

    async getTipStatus(tipId: string): Promise<{ tipId: string; status: TipStatus }> {
        const response = await client.get<ApiSuccessResponse<{ tipId: string; status: TipStatus }>>(`/tips/${tipId}/status`);
        return response.data.data;
    },

    async getSentTips() {
        const response = await client.get<ApiSuccessResponse<Array<{ tipId: string; amount: number; status: TipStatus }>>>('/tips/sent');
        return response.data.data;
    },
};
