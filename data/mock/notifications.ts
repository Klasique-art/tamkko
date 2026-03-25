import { NotificationItem } from '@/types/notification.types';

export const mockNotifications: NotificationItem[] = [
    {
        id: 'ntf_001',
        title: 'Tip Received',
        body: 'You received GHS 10 from @fan_joel',
        isRead: false,
        createdAt: '2026-03-24T14:00:00Z',
        deepLink: '/wallet',
    },
    {
        id: 'ntf_002',
        title: 'New Follower',
        body: '@ama.creator started following you',
        isRead: true,
        createdAt: '2026-03-24T13:00:00Z',
        deepLink: '/profile/followers',
    },
    {
        id: 'ntf_003',
        title: 'Room Invite',
        body: 'Join Late Night Studio room now',
        isRead: false,
        createdAt: '2026-03-23T18:30:00Z',
        deepLink: '/rooms/room_001',
    },
];
