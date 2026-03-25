import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { LeaderboardEntry } from '@/types/referral.types';

export const leaderboardService = {
    async getTopReferrers() {
        const response = await client.get<ApiSuccessResponse<LeaderboardEntry[]>>('/leaderboard/top-referrers');
        return response.data.data;
    },

    async getFastestGrowing() {
        const response = await client.get<ApiSuccessResponse<LeaderboardEntry[]>>('/leaderboard/fastest-growing');
        return response.data.data;
    },

    async getCampusLeaders() {
        const response = await client.get<ApiSuccessResponse<LeaderboardEntry[]>>('/leaderboard/campus-leaders');
        return response.data.data;
    },

    async getMyPosition() {
        const response = await client.get<ApiSuccessResponse<{ rank: number; category: string }[]>>('/leaderboard/my-position');
        return response.data.data;
    },
};
