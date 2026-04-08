import { mockCreatorAnalyticsByPeriod } from '@/data/mock/analytics';
import { AnalyticsPeriod, CreatorAnalyticsSnapshot } from '@/types/analytics.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const creatorAnalyticsService = {
    async getCreatorAnalytics(period: AnalyticsPeriod): Promise<CreatorAnalyticsSnapshot> {
        await delay(160);
        return mockCreatorAnalyticsByPeriod[period];
    },
};
