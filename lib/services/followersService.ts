import client from '@/lib/client';

export type FollowerItem = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isVerified: boolean;
    followedAt: string;
    bio: string;
    followersCount: number;
};

export type FollowersPageResult = {
    items: FollowerItem[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
};

const toNumber = (value: unknown, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const normalizeFollower = (raw: any): FollowerItem => ({
    id: String(raw?.id ?? raw?._id ?? ''),
    username: String(raw?.username ?? ''),
    displayName: String(raw?.display_name ?? raw?.displayName ?? ''),
    avatarUrl: String(raw?.avatar_url ?? raw?.avatarUrl ?? ''),
    isVerified: Boolean(raw?.is_verified ?? raw?.isVerified),
    followedAt: String(raw?.followed_at ?? raw?.followedAt ?? new Date().toISOString()),
    bio: String(raw?.bio ?? ''),
    followersCount: toNumber(raw?.followers_count ?? raw?.followersCount ?? 0),
});

export const followersService = {
    async getMyFollowersPage(params: {
        cursor?: string | null;
        limit?: number;
        query?: string;
    }): Promise<FollowersPageResult> {
        const { cursor = null, limit = 24, query = '' } = params;

        const response = await client.get('/users/me/followers', {
            params: {
                ...(cursor ? { cursor } : {}),
                limit,
                ...(query.trim() ? { q: query.trim() } : {}),
            },
        });

        const payload = response.data as {
            data?: {
                total_followers_count?: number;
                totalCount?: number;
                count?: number;
                followers?: any[];
                items?: any[];
                next_cursor?: string | null;
                nextCursor?: string | null;
                has_more?: boolean;
                hasMore?: boolean;
            };
        };

        const data = payload?.data ?? {};
        const rawItems = (data.followers ?? data.items ?? []) as any[];
        const items = rawItems.map(normalizeFollower).filter((item) => item.id && item.username);
        const nextCursor = (data.next_cursor ?? data.nextCursor ?? null) as string | null;
        const hasMoreFromApi = data.has_more ?? data.hasMore;
        const hasMore = typeof hasMoreFromApi === 'boolean' ? hasMoreFromApi : Boolean(nextCursor);

        const totalCount = toNumber(
            data.total_followers_count ?? data.totalCount ?? data.count,
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

