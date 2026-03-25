export type ReferralProfile = {
    referralCode: string;
    referralLink: string;
};

export type ReferralEarningsSummary = {
    thisWeek: number;
    thisMonth: number;
    allTime: number;
};

export type LeaderboardEntry = {
    rank: number;
    username: string;
    avatarUrl?: string;
    value: number;
    label: string;
};
