import {
    mockAmbassadorInviteStats,
    mockInitialAmbassadorStatus,
    mockMyLeaderboardPosition,
    mockReferralEarnings,
    mockReferralLeaderboardsByCategory,
    mockReferralNetwork,
    mockReferralProfile,
    mockReferralTransactions,
} from '@/data/mock/referral';
import {
    AmbassadorApplicationPayload,
    AmbassadorInviteStats,
    AmbassadorStatus,
    LeaderboardCategory,
    LeaderboardEntry,
    MyLeaderboardPosition,
    ReferralEarningsSummary,
    ReferralNetworkMember,
    ReferralProfile,
    ReferralRewardTransaction,
} from '@/types/referral.types';

const delay = async (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms));

let ambassadorStatusStore: AmbassadorStatus = { ...mockInitialAmbassadorStatus };

export const mockReferralService = {
    async getProfile(): Promise<ReferralProfile> {
        await delay();
        return { ...mockReferralProfile };
    },

    async getNetwork(): Promise<ReferralNetworkMember[]> {
        await delay();
        return [...mockReferralNetwork];
    },

    async getEarningsSummary(): Promise<ReferralEarningsSummary> {
        await delay();
        return { ...mockReferralEarnings };
    },

    async getRewardTransactions(): Promise<ReferralRewardTransaction[]> {
        await delay();
        return [...mockReferralTransactions];
    },

    async getLeaderboard(category: LeaderboardCategory): Promise<LeaderboardEntry[]> {
        await delay();
        return [...(mockReferralLeaderboardsByCategory[category] ?? [])];
    },

    async getMyLeaderboardPosition(): Promise<MyLeaderboardPosition[]> {
        await delay();
        return [...mockMyLeaderboardPosition];
    },

    async getAmbassadorStatus(): Promise<AmbassadorStatus> {
        await delay();
        return { ...ambassadorStatusStore };
    },

    async applyForAmbassador(payload: AmbassadorApplicationPayload): Promise<AmbassadorStatus> {
        await delay(220);
        ambassadorStatusStore = {
            ...ambassadorStatusStore,
            status: 'pending',
            isAmbassador: false,
            campus: payload.university || 'Campus',
            rewardRatePercent: mockReferralProfile.rewardRatePercent ?? 5,
            reviewMessage: 'Application submitted. Review usually completes in 3-5 business days.',
        };
        return { ...ambassadorStatusStore };
    },

    async getAmbassadorInviteStats(): Promise<AmbassadorInviteStats> {
        await delay();
        return { ...mockAmbassadorInviteStats };
    },
};
