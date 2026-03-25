import { VipRoom } from '@/types/room.types';

export const mockRooms: VipRoom[] = [
    {
        id: 'room_001',
        name: 'Late Night Studio',
        description: 'Behind-the-scenes creation sessions and Q&A.',
        entryFee: 15,
        currency: 'GHS',
        onlineCount: 92,
        role: 'member',
        hasJoined: true,
    },
    {
        id: 'room_002',
        name: 'Campus Creators Circle',
        description: 'Weekly community collaboration room.',
        entryFee: 5,
        currency: 'GHS',
        onlineCount: 31,
        role: 'member',
        hasJoined: false,
    },
    {
        id: 'room_003',
        name: 'Creator Strategy Lab',
        description: 'Monetization and growth strategy room.',
        entryFee: 20,
        currency: 'GHS',
        onlineCount: 58,
        role: 'creator',
        hasJoined: true,
    },
];
