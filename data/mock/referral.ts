import { LeaderboardEntry, ReferralEarningsSummary, ReferralProfile } from '@/types/referral.types';

export const mockReferralProfile: ReferralProfile = {
    referralCode: 'TAMKKO-58XQ',
    referralLink: 'https://tamkko.app/invite/TAMKKO-58XQ',
};

export const mockReferralEarnings: ReferralEarningsSummary = {
    thisWeek: 34.5,
    thisMonth: 120.75,
    allTime: 980.2,
};

export const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, username: '@klasique', value: 104, label: 'Invites' },
    { rank: 2, username: '@ama.creator', value: 91, label: 'Invites' },
    { rank: 3, username: '@campus.star', value: 73, label: 'Invites' },
];
