import { AnalyticsPeriod, CreatorAnalyticsSnapshot } from '@/types/analytics.types';

const snapshots: Record<AnalyticsPeriod, CreatorAnalyticsSnapshot> = {
    '7d': {
        period: '7d',
        summary: {
            totalViews: 128400,
            avgWatchSeconds: 24.8,
            engagementRate: 8.6,
            earningsGhs: 1640.5,
            tipsGhs: 930.2,
            subscriptionsGhs: 710.3,
            newFollowers: 482,
        },
        trend: [
            { label: 'Mon', views: 14200, watchTimeMinutes: 4900 },
            { label: 'Tue', views: 16700, watchTimeMinutes: 5310 },
            { label: 'Wed', views: 15400, watchTimeMinutes: 5040 },
            { label: 'Thu', views: 18800, watchTimeMinutes: 6120 },
            { label: 'Fri', views: 20100, watchTimeMinutes: 6490 },
            { label: 'Sat', views: 22600, watchTimeMinutes: 7350 },
            { label: 'Sun', views: 20600, watchTimeMinutes: 6780 },
        ],
        topVideos: [
            { id: 'vid_001', title: 'Street Dance Night', views: 40210, earningsGhs: 520.2, engagementRate: 10.4 },
            { id: 'vid_004', title: 'Night Rehearsal', views: 28440, earningsGhs: 382.1, engagementRate: 8.8 },
            { id: 'vid_002', title: 'Studio Session Snippet', views: 24980, earningsGhs: 341.7, engagementRate: 8.1 },
            { id: 'vid_005', title: 'Hook Challenge', views: 18810, earningsGhs: 248.9, engagementRate: 7.6 },
        ],
    },
    '30d': {
        period: '30d',
        summary: {
            totalViews: 512900,
            avgWatchSeconds: 22.9,
            engagementRate: 7.9,
            earningsGhs: 6320.75,
            tipsGhs: 3560.25,
            subscriptionsGhs: 2760.5,
            newFollowers: 1624,
        },
        trend: [
            { label: 'W1', views: 102300, watchTimeMinutes: 32800 },
            { label: 'W2', views: 118900, watchTimeMinutes: 37120 },
            { label: 'W3', views: 134200, watchTimeMinutes: 41590 },
            { label: 'W4', views: 157500, watchTimeMinutes: 48240 },
        ],
        topVideos: [
            { id: 'vid_001', title: 'Street Dance Night', views: 138220, earningsGhs: 1650.4, engagementRate: 9.8 },
            { id: 'vid_003', title: 'Campus Mic Challenge', views: 101340, earningsGhs: 1248.9, engagementRate: 8.5 },
            { id: 'vid_004', title: 'Night Rehearsal', views: 94980, earningsGhs: 1101.6, engagementRate: 7.9 },
            { id: 'vid_002', title: 'Studio Session Snippet', views: 84310, earningsGhs: 997.3, engagementRate: 7.6 },
        ],
    },
    '90d': {
        period: '90d',
        summary: {
            totalViews: 1492100,
            avgWatchSeconds: 21.4,
            engagementRate: 7.1,
            earningsGhs: 18340.2,
            tipsGhs: 10140.6,
            subscriptionsGhs: 8199.6,
            newFollowers: 4612,
        },
        trend: [
            { label: 'M1', views: 432200, watchTimeMinutes: 133100 },
            { label: 'M2', views: 491000, watchTimeMinutes: 149800 },
            { label: 'M3', views: 568900, watchTimeMinutes: 171500 },
        ],
        topVideos: [
            { id: 'vid_001', title: 'Street Dance Night', views: 402880, earningsGhs: 4460.9, engagementRate: 9.2 },
            { id: 'vid_003', title: 'Campus Mic Challenge', views: 309500, earningsGhs: 3680.4, engagementRate: 8.1 },
            { id: 'vid_004', title: 'Night Rehearsal', views: 281300, earningsGhs: 3295.1, engagementRate: 7.7 },
            { id: 'vid_002', title: 'Studio Session Snippet', views: 249120, earningsGhs: 2901.8, engagementRate: 7.3 },
        ],
    },
};

export const mockCreatorAnalyticsByPeriod = snapshots;
