import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { LeaderboardEntry, ReferralEarningsSummary, ReferralProfile } from '@/types/referral.types';

export const referralService = {
    async getMyReferralProfile(): Promise<ReferralProfile> {
        const response = await client.get<ApiSuccessResponse<ReferralProfile>>('/referral/my-code');
        return response.data.data;
    },

    async validateReferralCode(code: string) {
        const response = await client.get<ApiSuccessResponse<{ valid: boolean; inviterUsername?: string }>>(`/referral/validate/${code}`);
        return response.data.data;
    },

    async getNetwork() {
        const response = await client.get<ApiSuccessResponse<Array<{ username: string; joinedAt: string }>>>('/referral/network');
        return response.data.data;
    },

    async getEarningsSummary(): Promise<ReferralEarningsSummary> {
        const response = await client.get<ApiSuccessResponse<ReferralEarningsSummary>>('/referral/earnings');
        return response.data.data;
    },

    async getTopReferrers(): Promise<LeaderboardEntry[]> {
        const response = await client.get<ApiSuccessResponse<LeaderboardEntry[]>>('/leaderboard/top-referrers');
        return response.data.data;
    },
};
