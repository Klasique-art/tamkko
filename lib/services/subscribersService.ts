import { mockMySubscribersAllTime, MockSubscriber } from '@/data/mock/subscribers';

export type SubscribersPageResult = {
    items: MockSubscriber[];
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const byMostRecent = (a: MockSubscriber, b: MockSubscriber) =>
    new Date(b.subscribedSince).getTime() - new Date(a.subscribedSince).getTime();

export const subscribersService = {
    async getMySubscribersPage(params: {
        cursor?: string | null;
        limit?: number;
        query?: string;
    }): Promise<SubscribersPageResult> {
        const { cursor = null, limit = 24, query = '' } = params;
        await delay(120);

        const normalized = query.trim().toLowerCase();
        const source = [...mockMySubscribersAllTime].sort(byMostRecent);
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
