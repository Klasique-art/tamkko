export type RoomRole = 'creator' | 'member';

export type VipRoom = {
    id: string;
    name: string;
    description: string;
    entryFee: number;
    currency: string;
    onlineCount: number;
    role: RoomRole;
    hasJoined: boolean;
};

export type RoomMessage = {
    id: string;
    roomId: string;
    senderUsername: string;
    text: string;
    createdAt: string;
    isPinned?: boolean;
};
