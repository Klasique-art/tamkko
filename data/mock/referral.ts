import {
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

export const mockReferralProfile: ReferralProfile = {
    referralCode: 'TAMKKO-58XQ',
    referralLink: 'https://tamkko.app/invite/TAMKKO-58XQ',
    rewardRatePercent: 5,
    ambassadorRewardRatePercent: 8,
};

export const mockReferralEarnings: ReferralEarningsSummary = {
    thisWeek: 34.5,
    thisMonth: 120.75,
    allTime: 980.2,
    pendingPayout: 14.8,
};

export const mockReferralNetwork: ReferralNetworkMember[] = [
    {
        id: 'ref_usr_001',
        username: '@joelbeats',
        displayName: 'Joel Beats',
        joinedAt: '2026-04-01T08:22:00Z',
        totalTipsGhs: 612.4,
        rewardEarnedGhs: 30.62,
        campus: 'UG',
        isAmbassador: false,
    },
    {
        id: 'ref_usr_002',
        username: '@ama.creates',
        displayName: 'Ama Creates',
        joinedAt: '2026-03-27T10:01:00Z',
        totalTipsGhs: 931.8,
        rewardEarnedGhs: 46.59,
        campus: 'KNUST',
        isAmbassador: true,
    },
    {
        id: 'ref_usr_003',
        username: '@campusflow',
        displayName: 'Campus Flow',
        joinedAt: '2026-03-20T16:15:00Z',
        totalTipsGhs: 318.2,
        rewardEarnedGhs: 15.91,
        campus: 'UPSA',
        isAmbassador: false,
    },
    {
        id: 'ref_usr_004',
        username: '@nana.live',
        displayName: 'Nana Live',
        joinedAt: '2026-03-18T09:40:00Z',
        totalTipsGhs: 270.5,
        rewardEarnedGhs: 13.53,
        campus: 'UCC',
        isAmbassador: false,
    },
    {
        id: 'ref_usr_005',
        username: '@sark.stream',
        displayName: 'Sark Stream',
        joinedAt: '2026-03-11T13:08:00Z',
        totalTipsGhs: 1211.2,
        rewardEarnedGhs: 60.56,
        campus: 'UEW',
        isAmbassador: true,
    },
    {
        id: 'ref_usr_006',
        username: '@tracey.vibes',
        displayName: 'Tracey Vibes',
        joinedAt: '2026-03-06T18:35:00Z',
        totalTipsGhs: 199.3,
        rewardEarnedGhs: 9.97,
        campus: null,
        isAmbassador: false,
    },
];

export const mockReferralTransactions: ReferralRewardTransaction[] = [
    {
        id: 'rwd_001',
        referredUsername: '@ama.creates',
        tipAmountGhs: 150,
        rewardAmountGhs: 7.5,
        createdAt: '2026-04-07T14:05:00Z',
        status: 'credited',
    },
    {
        id: 'rwd_002',
        referredUsername: '@joelbeats',
        tipAmountGhs: 98,
        rewardAmountGhs: 4.9,
        createdAt: '2026-04-06T11:22:00Z',
        status: 'credited',
    },
    {
        id: 'rwd_003',
        referredUsername: '@sark.stream',
        tipAmountGhs: 210,
        rewardAmountGhs: 10.5,
        createdAt: '2026-04-04T19:12:00Z',
        status: 'pending',
    },
    {
        id: 'rwd_004',
        referredUsername: '@campusflow',
        tipAmountGhs: 64,
        rewardAmountGhs: 3.2,
        createdAt: '2026-03-30T09:47:00Z',
        status: 'credited',
    },
    {
        id: 'rwd_005',
        referredUsername: '@nana.live',
        tipAmountGhs: 45,
        rewardAmountGhs: 2.25,
        createdAt: '2026-03-28T07:41:00Z',
        status: 'credited',
    },
    {
        id: 'rwd_006',
        referredUsername: '@tracey.vibes',
        tipAmountGhs: 120,
        rewardAmountGhs: 6,
        createdAt: '2026-03-22T21:03:00Z',
        status: 'credited',
    },
];

const topReferrers: LeaderboardEntry[] = [
    { rank: 1, username: '@klasique', displayName: 'Klasique', value: 104, label: 'Creators Referred', badge: 'gold', isAmbassador: true, campus: 'UG' },
    { rank: 2, username: '@ama.creator', displayName: 'Ama Creator', value: 91, label: 'Creators Referred', badge: 'silver', isAmbassador: true, campus: 'KNUST' },
    { rank: 3, username: '@campus.star', displayName: 'Campus Star', value: 73, label: 'Creators Referred', badge: 'bronze', isAmbassador: true, campus: 'UCC' },
    { rank: 4, username: '@melo.wave', displayName: 'Melo Wave', value: 60, label: 'Creators Referred', badge: null, isAmbassador: false, campus: null },
    { rank: 5, username: '@joelbeats', displayName: 'Joel Beats', value: 58, label: 'Creators Referred', badge: null, isAmbassador: false, campus: 'UG' },
];

const fastestGrowing: LeaderboardEntry[] = [
    { rank: 1, username: '@ama.creator', displayName: 'Ama Creator', value: 780.4, label: '30D Reward (GHS)', badge: 'gold', isAmbassador: true, campus: 'KNUST' },
    { rank: 2, username: '@klasique', displayName: 'Klasique', value: 710.2, label: '30D Reward (GHS)', badge: 'silver', isAmbassador: true, campus: 'UG' },
    { rank: 3, username: '@sark.stream', displayName: 'Sark Stream', value: 654.1, label: '30D Reward (GHS)', badge: 'bronze', isAmbassador: true, campus: 'UEW' },
    { rank: 4, username: '@nana.live', displayName: 'Nana Live', value: 480.3, label: '30D Reward (GHS)', badge: null, isAmbassador: false, campus: 'UCC' },
    { rank: 5, username: '@tracey.vibes', displayName: 'Tracey Vibes', value: 433.9, label: '30D Reward (GHS)', badge: null, isAmbassador: false, campus: null },
];

const campusLeaders: LeaderboardEntry[] = [
    { rank: 1, username: '@klasique', displayName: 'Klasique', value: 49, label: 'Campus Invites', badge: 'gold', isAmbassador: true, campus: 'UG' },
    { rank: 2, username: '@ama.creator', displayName: 'Ama Creator', value: 44, label: 'Campus Invites', badge: 'silver', isAmbassador: true, campus: 'KNUST' },
    { rank: 3, username: '@campus.star', displayName: 'Campus Star', value: 38, label: 'Campus Invites', badge: 'bronze', isAmbassador: true, campus: 'UCC' },
    { rank: 4, username: '@sark.stream', displayName: 'Sark Stream', value: 34, label: 'Campus Invites', badge: null, isAmbassador: true, campus: 'UEW' },
    { rank: 5, username: '@joelbeats', displayName: 'Joel Beats', value: 27, label: 'Campus Invites', badge: null, isAmbassador: false, campus: 'UG' },
];

export const mockReferralLeaderboardsByCategory: Record<LeaderboardCategory, LeaderboardEntry[]> = {
    top_referrers: topReferrers,
    fastest_growing: fastestGrowing,
    campus_leaders: campusLeaders,
};

export const mockMyLeaderboardPosition: MyLeaderboardPosition[] = [
    { category: 'top_referrers', rank: 12, totalParticipants: 2480, badge: null },
    { category: 'fastest_growing', rank: 9, totalParticipants: 2480, badge: null },
    { category: 'campus_leaders', rank: 4, totalParticipants: 720, badge: null },
];

export const mockInitialAmbassadorStatus: AmbassadorStatus = {
    isAmbassador: false,
    status: 'not_applied',
    campus: null,
    ambassadorSince: null,
    badgeLabel: null,
    rewardRatePercent: 5,
    reviewMessage: null,
};

export const mockAmbassadorInviteStats: AmbassadorInviteStats = {
    campus: 'UG',
    totalInvites: 104,
    approvedCreators: 89,
    activeCreatorsThisMonth: 31,
    thisMonthRewardGhs: 120.75,
};

export const mockLeaderboard: LeaderboardEntry[] = topReferrers;
