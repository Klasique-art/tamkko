import { mockCreatorProfiles } from '@/data/mock/creators';
import { getFollowedCreators, normalizeCreatorHandle } from '@/data/mock/following';

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toDateStampByIndex = (index: number) => {
    const base = new Date('2026-03-01T10:00:00Z').getTime();
    const offsetDays = index * 7;
    return new Date(base + offsetDays * 24 * 60 * 60 * 1000).toISOString();
};

const buildFollowingItems = (): FollowingListItem[] => {
    const followed = getFollowedCreators();

    return mockCreatorProfiles
        .filter((creator) => followed.has(normalizeCreatorHandle(creator.username)))
        .map((creator, index) => ({
            id: creator.id,
            username: normalizeCreatorHandle(creator.username),
            displayName: creator.displayName,
            bio: creator.bio,
            avatarUrl: creator.avatarUrl,
            followersCount: creator.followersCount,
            isVerified: index < 2,
            followedSince: toDateStampByIndex(index),
        }))
        .sort((a, b) => new Date(b.followedSince).getTime() - new Date(a.followedSince).getTime());
};

export const followingService = {
    async getMyFollowingPage(params: {
        cursor?: string | null;
        limit?: number;
        query?: string;
    }): Promise<FollowingPageResult> {
        const { cursor = null, limit = 24, query = '' } = params;
        await delay(120);

        const normalized = query.trim().toLowerCase();
        const source = buildFollowingItems();
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
