export type MockFollower = {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    followersCount: number;
    isVerified: boolean;
    followedSince: string;
};

export const mockMyFollowers: MockFollower[] = [
    {
        id: 'f_001',
        username: '@klasique',
        displayName: 'Klasique Official',
        bio: 'Afrobeats artist, performer, and creator mentor.',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        followersCount: 384200,
        isVerified: true,
        followedSince: '2026-01-11T10:30:00Z',
    },
    {
        id: 'f_002',
        username: '@ama.creator',
        displayName: 'Ama Creator',
        bio: 'Dance tutorials and behind-the-scenes studio sessions.',
        avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
        followersCount: 192400,
        isVerified: true,
        followedSince: '2026-02-03T15:20:00Z',
    },
    {
        id: 'f_003',
        username: '@campus.star',
        displayName: 'Campus Star',
        bio: 'Campus music, dance challenge host, and trend curator.',
        avatarUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80',
        followersCount: 85300,
        isVerified: false,
        followedSince: '2026-02-17T09:45:00Z',
    },
    {
        id: 'f_004',
        username: '@dj.kobby',
        displayName: 'DJ Kobby',
        bio: 'Live sets every weekend and crowd energy mixes.',
        avatarUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80',
        followersCount: 69100,
        isVerified: false,
        followedSince: '2026-03-06T20:10:00Z',
    },
    {
        id: 'f_005',
        username: '@nana.vibes',
        displayName: 'Nana Vibes',
        bio: 'Street style clips and dance reaction videos.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        followersCount: 124500,
        isVerified: false,
        followedSince: '2026-03-12T11:55:00Z',
    },
    {
        id: 'f_006',
        username: '@afro.groove',
        displayName: 'Afro Groove',
        bio: 'Daily short performance clips from Accra nights.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        followersCount: 101200,
        isVerified: false,
        followedSince: '2026-03-23T14:18:00Z',
    },
];
