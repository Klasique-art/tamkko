export type AnalyticsPeriod = '7d' | '30d' | '90d';

export type CreatorAnalyticsPoint = {
    label: string;
    views: number;
    watchTimeMinutes: number;
};

export type CreatorAnalyticsTopVideo = {
    id: string;
    title: string;
    views: number;
    earningsGhs: number;
    engagementRate: number;
};

export type CreatorAnalyticsSnapshot = {
    period: AnalyticsPeriod;
    summary: {
        totalViews: number;
        avgWatchSeconds: number;
        engagementRate: number;
        earningsGhs: number;
        tipsGhs: number;
        subscriptionsGhs: number;
        newFollowers: number;
    };
    trend: CreatorAnalyticsPoint[];
    topVideos: CreatorAnalyticsTopVideo[];
};
