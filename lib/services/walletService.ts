import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import {
    EarningsByVideoItem,
    MomoAccount,
    WalletEarningsBreakdownSummary,
    WalletSummary,
    WalletTransaction,
} from '@/types/wallet.types';

type WalletSummaryApi = {
    currency: string;
    available_balance: number;
    pending_balance: number;
    lifetime_earnings: number;
};

type WalletTransactionApi = {
    id: string;
    type: 'tip' | 'subscription' | 'withdrawal' | 'referral_reward';
    direction?: 'credit' | 'debit';
    title?: string;
    subtitle?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';
    created_at: string;
};

type WalletTransactionsApiResponse = {
    transactions: WalletTransactionApi[];
    next_cursor?: string | null;
};

type EarningsByVideoApi = {
    video_id: string;
    title: string;
    tips_earnings: number;
    subscriptions_earnings: number;
    total_earnings: number;
    views: number;
};

type EarningsByVideoApiResponse = {
    summary?: {
        currency?: string;
        total_earnings: number;
        total_views: number;
        tips_total: number;
        subscriptions_total: number;
        referral_rewards_total?: number;
    };
    videos: EarningsByVideoApi[];
};

type MomoAccountApi = {
    network?: 'mtn' | 'vodafone' | 'airteltigo' | null;
    phone_number?: string | null;
    account_name?: string | null;
    is_verified?: boolean | null;
    updated_at?: string | null;
};

type MomoAccountResponse = {
    account: MomoAccountApi;
};

type BeginMomoUpdateResponse = {
    challenge_id: string;
    masked_phone: string;
    expires_at?: string;
    account_name?: string;
    otp?: string;
};

const mapSummary = (item: WalletSummaryApi): WalletSummary => ({
    currency: item.currency,
    availableBalance: item.available_balance,
    pendingBalance: item.pending_balance,
    lifetimeEarnings: item.lifetime_earnings,
});

const mapTransaction = (item: WalletTransactionApi): WalletTransaction => ({
    id: item.id,
    type: item.type,
    direction: item.direction,
    title: item.title,
    subtitle: item.subtitle,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
    createdAt: item.created_at,
});

const mapEarningsByVideo = (item: EarningsByVideoApi): EarningsByVideoItem => ({
    videoId: item.video_id,
    title: item.title,
    tipsEarnings: item.tips_earnings,
    subscriptionsEarnings: item.subscriptions_earnings,
    totalEarnings: item.total_earnings,
    views: item.views,
});

const mapEarningsSummary = (
    item: NonNullable<EarningsByVideoApiResponse['summary']>
): WalletEarningsBreakdownSummary => ({
    currency: item.currency ?? 'GHS',
    totalEarnings: item.total_earnings,
    totalViews: item.total_views,
    tipsTotal: item.tips_total,
    subscriptionsTotal: item.subscriptions_total,
    referralRewardsTotal: item.referral_rewards_total ?? 0,
});

const mapMomoAccount = (item: MomoAccountApi): MomoAccount => ({
    network: item.network ?? 'mtn',
    phoneNumber: item.phone_number ?? '',
    accountName: item.account_name ?? '',
    isVerified: Boolean(item.is_verified),
    updatedAt: item.updated_at ?? new Date(0).toISOString(),
});

export const walletService = {
    async getSummary(): Promise<WalletSummary> {
        const response = await client.get<ApiSuccessResponse<{ wallet: WalletSummaryApi }> | { wallet: WalletSummaryApi }>(
            '/wallet'
        );
        const payload = response.data as ApiSuccessResponse<{ wallet: WalletSummaryApi }> & { wallet?: WalletSummaryApi };
        const wallet = payload.data?.wallet ?? payload.wallet;
        if (!wallet) throw new Error('Wallet summary payload missing wallet object.');
        return mapSummary(wallet);
    },

    async getTransactions(limit?: number, cursor?: string): Promise<{ transactions: WalletTransaction[]; nextCursor: string | null }> {
        const response = await client.get<ApiSuccessResponse<WalletTransactionsApiResponse> | WalletTransactionsApiResponse>(
            '/wallet/transactions',
            {
                params: {
                    ...(typeof limit === 'number' ? { limit } : {}),
                    ...(cursor ? { cursor } : {}),
                },
            }
        );
        const payload = response.data as ApiSuccessResponse<WalletTransactionsApiResponse> & WalletTransactionsApiResponse;
        const source = payload.data ?? payload;
        return {
            transactions: (source.transactions ?? []).map(mapTransaction),
            nextCursor: source.next_cursor ?? null,
        };
    },

    async getRecentActivities(limit = 4): Promise<WalletTransaction[]> {
        const response = await this.getTransactions(limit);
        return response.transactions;
    },

    async getEarningsByVideo(period: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<EarningsByVideoItem[]> {
        const result = await this.getEarningsBreakdown(period);
        return result.videos;
    },

    async getEarningsBreakdown(
        period: '7d' | '30d' | '90d' | 'all' = '30d'
    ): Promise<{ summary: WalletEarningsBreakdownSummary; videos: EarningsByVideoItem[] }> {
        const response = await client.get<ApiSuccessResponse<EarningsByVideoApiResponse> | EarningsByVideoApiResponse>(
            '/wallet/earnings/by-video',
            {
                params: {
                    period,
                    sort: 'earnings',
                },
            }
        );
        const payload = response.data as ApiSuccessResponse<EarningsByVideoApiResponse> & EarningsByVideoApiResponse;
        const source = payload.data ?? payload;
        const videos = (source.videos ?? []).map(mapEarningsByVideo);
        const fallbackSummary: WalletEarningsBreakdownSummary = {
            currency: 'GHS',
            totalEarnings: videos.reduce((sum, item) => sum + item.totalEarnings, 0),
            totalViews: videos.reduce((sum, item) => sum + item.views, 0),
            tipsTotal: videos.reduce((sum, item) => sum + item.tipsEarnings, 0),
            subscriptionsTotal: videos.reduce((sum, item) => sum + item.subscriptionsEarnings, 0),
            referralRewardsTotal: 0,
        };

        return {
            summary: source.summary ? mapEarningsSummary(source.summary) : fallbackSummary,
            videos,
        };
    },

    async getMomoAccount(): Promise<MomoAccount> {
        const response = await client.get<ApiSuccessResponse<MomoAccountResponse> | MomoAccountResponse>('/wallet/momo-account');
        const payload = response.data as ApiSuccessResponse<MomoAccountResponse> & MomoAccountResponse;
        const source = payload.data ?? payload;
        if (!source.account) throw new Error('MoMo account payload missing account object.');
        return mapMomoAccount(source.account);
    },

    async beginMomoAccountUpdate(input: {
        network: 'mtn' | 'vodafone' | 'airteltigo';
        phoneNumber: string;
    }): Promise<{ challengeId: string; maskedPhone: string; accountName?: string; otp?: string }> {
        const response = await client.post<ApiSuccessResponse<BeginMomoUpdateResponse> | BeginMomoUpdateResponse>(
            '/wallet/momo-account/update/begin',
            {
                network: input.network,
                phone_number: input.phoneNumber,
            }
        );
        const payload = response.data as ApiSuccessResponse<BeginMomoUpdateResponse> & BeginMomoUpdateResponse;
        const source = payload.data ?? payload;
        return {
            challengeId: source.challenge_id,
            maskedPhone: source.masked_phone,
            accountName: source.account_name,
            otp: source.otp,
        };
    },

    async confirmMomoAccountUpdate(
        challengeId: string,
        otp: string,
        input: {
            network: 'mtn' | 'vodafone' | 'airteltigo';
            phoneNumber: string;
        }
    ): Promise<{ ok: boolean; message: string; account: MomoAccount }> {
        const response = await client.post<
            | ApiSuccessResponse<{ ok?: boolean; message?: string; account: MomoAccountApi }>
            | { ok?: boolean; message?: string; account: MomoAccountApi }
        >('/wallet/momo-account/update/confirm', {
            challenge_id: challengeId,
            otp,
            network: input.network,
            phone_number: input.phoneNumber,
        });
        const payload = response.data as ApiSuccessResponse<{ ok?: boolean; message?: string; account: MomoAccountApi }> & {
            ok?: boolean;
            message?: string;
            account?: MomoAccountApi;
        };
        const source = payload.data ?? payload;
        if (!source.account) throw new Error('MoMo confirm payload missing account object.');
        return {
            ok: source.ok ?? true,
            message: source.message ?? 'Mobile money account updated.',
            account: mapMomoAccount(source.account),
        };
    },
};
