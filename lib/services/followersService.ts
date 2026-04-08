import { mockMyFollowers, MockFollower } from '@/data/mock/followers';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const byMostRecentFollow = (a: MockFollower, b: MockFollower) =>
    new Date(b.followedSince).getTime() - new Date(a.followedSince).getTime();

export type FollowersPageResult = {
    items: MockFollower[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
};

export const followersService = {
    async getMyFollowers(): Promise<MockFollower[]> {
        await delay(140);
        return [...mockMyFollowers].sort(byMostRecentFollow);
    },

    async getMyFollowersPage(params: {
        cursor?: string | null;
        limit?: number;
        query?: string;
    }): Promise<FollowersPageResult> {
        const { cursor = null, limit = 24, query = '' } = params;
        await delay(120);

        const normalized = query.trim().toLowerCase();
        const source = [...mockMyFollowers].sort(byMostRecentFollow);
        const filtered = normalized
            ? source.filter(
                (item) =>
                    item.username.toLowerCase().includes(normalized) ||
                    item.displayName.toLowerCase().includes(normalized)
            )
            : source;

        const startIndex = cursor ? Number(cursor) : 0;
        const safeStart = Number.isFinite(startIndex) && startIndex >= 0 ? startIndex : 0;
        const slice = filtered.slice(safeStart, safeStart + limit);
        const nextIndex = safeStart + slice.length;
        const hasMore = nextIndex < filtered.length;

        return {
            items: slice,
            nextCursor: hasMore ? String(nextIndex) : null,
            hasMore,
            totalCount: filtered.length,
        };
    },
};
