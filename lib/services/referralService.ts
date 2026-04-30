import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import {
    AmbassadorApplicationPayload,
    AmbassadorStatus,
    LeaderboardEntry,
    ReferralEarningsSummary,
    ReferralProfile,
} from '@/types/referral.types';

type AmbassadorStatusApi = {
    is_ambassador: boolean;
    application_status: 'not_applied' | 'pending' | 'approved' | 'rejected';
    reward_rate_percent: number;
    application_id?: string | null;
    reviewed_at?: string | null;
    rejection_reason?: string | null;
};

const inferPlatformFromUrl = (rawUrl: string): string | null => {
    try {
        const url = new URL(rawUrl);
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        if (host.includes('instagram.com')) return 'instagram';
        if (host.includes('tiktok.com')) return 'tiktok';
        if (host === 'x.com' || host.includes('twitter.com')) return 'x';
        if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
        if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook';
        if (host.includes('linkedin.com')) return 'linkedin';
        return host.split('.')[0] || null;
    } catch {
        return null;
    }
};

const mapAmbassadorStatus = (item: AmbassadorStatusApi): AmbassadorStatus => ({
    isAmbassador: item.is_ambassador,
    status: item.application_status,
    rewardRatePercent: item.reward_rate_percent,
    applicationId: item.application_id ?? null,
    reviewedAt: item.reviewed_at ?? null,
    rejectionReason: item.rejection_reason ?? null,
    reviewMessage: item.rejection_reason ?? null,
});

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
        const response = await client.get<ApiSuccessResponse<{ username: string; joinedAt: string }[]>>('/referral/network');
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

    async getAmbassadorStatus(): Promise<AmbassadorStatus> {
        const response = await client.get<ApiSuccessResponse<AmbassadorStatusApi>>('/referral/ambassador/status');
        return mapAmbassadorStatus(response.data.data);
    },

    async applyForAmbassador(payload: AmbassadorApplicationPayload): Promise<AmbassadorStatus> {
        const socialLinks = payload.socialFollowing as unknown as { platform?: string; url?: string }[] | undefined;
        const socialLinksObject = (socialLinks ?? []).reduce<Record<string, string>>((acc, entry) => {
            const value = String(entry?.url ?? '').trim();
            const inferredKey = inferPlatformFromUrl(value);
            const key = String(entry?.platform ?? inferredKey ?? '').trim().toLowerCase();
            if (!key || !value) return acc;
            acc[key] = value;
            return acc;
        }, {});

        await client.post('/referral/ambassador/apply', {
            campus: payload.campus,
            faculty: payload.faculty,
            student_id: payload.studentId,
            graduation_year: payload.graduationYear,
            social_links: socialLinksObject,
            why_apply: payload.whyApply,
        });
        return this.getAmbassadorStatus();
    },
};
