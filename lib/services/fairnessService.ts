import client from '@/lib/client';
import { DrawVerificationData } from '@/types/fairness.types';

export const fairnessService = {
    async getDrawVerification(drawId: string): Promise<DrawVerificationData> {
        const response = await client.get<{
            success: boolean;
            data: DrawVerificationData;
        }>(`/draws/${drawId}/verify/`);
        return response.data.data;
    },
};

