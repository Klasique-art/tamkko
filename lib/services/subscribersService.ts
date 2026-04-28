import client from '@/lib/client';

export type SubscriberStatus = 'active' | 'cancelled' | 'expired';

export type SubscriberItem = {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    followersCount: number;
    isVerified: boolean;
    subscribedSince: string;
    status: SubscriberStatus;
};

export type SubscribersPageResult = {
    items: SubscriberItem[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
};

const toNumber = (value: unknown, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const normalizeStatus = (raw: any): SubscriberStatus => {
    const value = String(raw?.status ?? raw?.subscription_status ?? '').toLowerCase();
    if (value === 'cancelled' || value === 'canceled') return 'cancelled';
    if (value === 'expired') return 'expired';
    return 'active';
};

const normalizeSubscriber = (raw: any): SubscriberItem => ({
    id: String(raw?.id ?? raw?._id ?? ''),
    username: String(raw?.username ?? ''),
    displayName: String(raw?.display_name ?? raw?.displayName ?? ''),
    bio: String(raw?.bio ?? ''),
    avatarUrl: String(raw?.avatar_url ?? raw?.avatarUrl ?? ''),
    followersCount: toNumber(raw?.followers_count ?? raw?.followersCount ?? 0),
    isVerified: Boolean(raw?.is_verified ?? raw?.isVerified),
    subscribedSince: String(raw?.subscribed_since ?? raw?.subscribedSince ?? raw?.followed_at ?? new Date().toISOString()),
    status: normalizeStatus(raw),
});

export const subscribersService = {
    async getMySubscribersPage(params: {
        cursor?: string | null;
        limit?: number;
        query?: string;
    }): Promise<SubscribersPageResult> {
        const { cursor = null, limit = 24, query = '' } = params;

        const response = await client.get('/users/me/subscribers', {
            params: {
                ...(cursor ? { cursor } : {}),
                limit,
                ...(query.trim() ? { q: query.trim() } : {}),
            },
        });

        const payload = response.data as {
            data?: {
                total_subscribers_count?: number;
                totalCount?: number;
                count?: number;
                subscribers?: any[];
                items?: any[];
                next_cursor?: string | null;
                nextCursor?: string | null;
                has_more?: boolean;
                hasMore?: boolean;
            };
        };

        const data = payload?.data ?? {};
        const rawItems = (data.subscribers ?? data.items ?? []) as any[];
        const items = rawItems.map(normalizeSubscriber).filter((item) => item.id && item.username);
        const nextCursor = (data.next_cursor ?? data.nextCursor ?? null) as string | null;
        const hasMoreFromApi = data.has_more ?? data.hasMore;
        const hasMore = typeof hasMoreFromApi === 'boolean' ? hasMoreFromApi : Boolean(nextCursor);
        const totalCount = toNumber(
            data.total_subscribers_count ?? data.totalCount ?? data.count,
            items.length
        );

        return {
            items,
            nextCursor,
            hasMore,
            totalCount,
        };
    },
};

