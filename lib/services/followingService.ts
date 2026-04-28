import client from '@/lib/client';

export type FollowingListItem = {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    followersCount: number;
    isVerified: boolean;
    followedSince: string;
};

export type FollowingPageResult = {
    items: FollowingListItem[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
};

const toNumber = (value: unknown, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const normalizeFollowing = (raw: any): FollowingListItem => ({
    id: String(raw?.id ?? raw?._id ?? ''),
    username: String(raw?.username ?? ''),
    displayName: String(raw?.display_name ?? raw?.displayName ?? ''),
    avatarUrl: String(raw?.avatar_url ?? raw?.avatarUrl ?? ''),
    isVerified: Boolean(raw?.is_verified ?? raw?.isVerified),
    followedSince: String(raw?.followed_at ?? raw?.followedAt ?? new Date().toISOString()),
    bio: String(raw?.bio ?? ''),
    followersCount: toNumber(raw?.followers_count ?? raw?.followersCount ?? 0),
});

export const followingService = {
    async getMyFollowingPage(params: {
        cursor?: string | null;
        limit?: number;
        query?: string;
    }): Promise<FollowingPageResult> {
        const { cursor = null, limit = 24, query = '' } = params;

        const response = await client.get('/users/me/following', {
            params: {
                ...(cursor ? { cursor } : {}),
                limit,
                ...(query.trim() ? { q: query.trim() } : {}),
            },
        });

        const payload = response.data as {
            data?: {
                total_following_count?: number;
                totalCount?: number;
                count?: number;
                following?: any[];
                items?: any[];
                next_cursor?: string | null;
                nextCursor?: string | null;
                has_more?: boolean;
                hasMore?: boolean;
            };
        };

        const data = payload?.data ?? {};
        const rawItems = (data.following ?? data.items ?? []) as any[];
        const items = rawItems.map(normalizeFollowing).filter((item) => item.id && item.username);
        const nextCursor = (data.next_cursor ?? data.nextCursor ?? null) as string | null;
        const hasMoreFromApi = data.has_more ?? data.hasMore;
        const hasMore = typeof hasMoreFromApi === 'boolean' ? hasMoreFromApi : Boolean(nextCursor);

        const totalCount = toNumber(
            data.total_following_count ?? data.totalCount ?? data.count,
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

