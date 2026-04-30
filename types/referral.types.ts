export type ReferralProfile = {
    referralCode: string;
    referralLink: string;
    rewardRatePercent?: number;
    ambassadorRewardRatePercent?: number;
};

export type ReferralEarningsSummary = {
    thisWeek: number;
    thisMonth: number;
    allTime: number;
    pendingPayout?: number;
};

export type LeaderboardEntry = {
    rank: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    value: number;
    label: string;
    badge?: 'gold' | 'silver' | 'bronze' | null;
    isAmbassador?: boolean;
    campus?: string | null;
};

export type ReferralNetworkMember = {
    id: string;
    username: string;
    displayName: string;
    joinedAt: string;
    totalTipsGhs: number;
    rewardEarnedGhs: number;
    campus?: string | null;
    isAmbassador?: boolean;
};

export type ReferralRewardTransaction = {
    id: string;
    referredUsername: string;
    tipAmountGhs: number;
    rewardAmountGhs: number;
    createdAt: string;
    status: 'pending' | 'credited';
};

export type LeaderboardCategory = 'top_referrers' | 'fastest_growing' | 'campus_leaders';

export type MyLeaderboardPosition = {
    category: LeaderboardCategory;
    rank: number;
    totalParticipants: number;
    badge?: 'gold' | 'silver' | 'bronze' | null;
};

export type AmbassadorStatus = {
    isAmbassador: boolean;
    status: 'not_applied' | 'pending' | 'approved' | 'rejected';
    campus?: string | null;
    ambassadorSince?: string | null;
    applicationId?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    badgeLabel?: string | null;
    rewardRatePercent: number;
    reviewMessage?: string | null;
};

export type AmbassadorInviteStats = {
    campus: string;
    totalInvites: number;
    approvedCreators: number;
    activeCreatorsThisMonth: number;
    thisMonthRewardGhs: number;
};

export type AmbassadorApplicationPayload = {
    campus: string;
    faculty: string;
    studentId: string;
    graduationYear: number;
    socialFollowing: {
        platform?: string;
        url: string;
    }[];
    whyApply: string;
};
