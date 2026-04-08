export type MockSubscriberStatus = 'active' | 'cancelled' | 'expired';

export type MockSubscriber = {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    followersCount: number;
    isVerified: boolean;
    subscribedSince: string;
    lastActiveAt: string;
    status: MockSubscriberStatus;
};

export const mockMySubscribersAllTime: MockSubscriber[] = [
    {
        id: 's_001',
        username: '@ama.creator',
        displayName: 'Ama Creator',
        bio: 'Dance tutorials and behind-the-scenes studio sessions.',
        avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
        followersCount: 192400,
        isVerified: true,
        subscribedSince: '2025-10-01T12:00:00Z',
        lastActiveAt: '2026-04-07T19:00:00Z',
        status: 'active',
    },
    {
        id: 's_002',
        username: '@campus.star',
        displayName: 'Campus Star',
        bio: 'Campus music, dance challenge host, and trend curator.',
        avatarUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80',
        followersCount: 85300,
        isVerified: false,
        subscribedSince: '2025-12-18T09:20:00Z',
        lastActiveAt: '2026-02-14T10:05:00Z',
        status: 'expired',
    },
    {
        id: 's_003',
        username: '@dj.kobby',
        displayName: 'DJ Kobby',
        bio: 'Live sets every weekend and crowd energy mixes.',
        avatarUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80',
        followersCount: 69100,
        isVerified: false,
        subscribedSince: '2026-01-27T14:30:00Z',
        lastActiveAt: '2026-03-21T21:15:00Z',
        status: 'cancelled',
    },
    {
        id: 's_004',
        username: '@nana.vibes',
        displayName: 'Nana Vibes',
        bio: 'Street style clips and dance reaction videos.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        followersCount: 124500,
        isVerified: false,
        subscribedSince: '2026-02-02T18:00:00Z',
        lastActiveAt: '2026-04-06T16:45:00Z',
        status: 'active',
    },
];
