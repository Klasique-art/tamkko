import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import {
    EarningsByVideoItem,
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
};
