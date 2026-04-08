export type RoomRole = 'creator' | 'member';
export type RoomStatus = 'active' | 'closed' | 'suspended';
export type RoomDiscountType = 'none' | 'fixed' | 'percent' | 'free';
export type RoomAccessStatus = 'pending' | 'granted' | 'failed';
export type RoomMessageType = 'text' | 'system_tip' | 'system_notice';

export type VipRoom = {
    id: string;
    name: string;
    description: string;
    entryFee: number;
    currency: string;
    onlineCount: number;
    memberCount: number;
    role: RoomRole;
    hasJoined: boolean;
    hasPaid: boolean;
    isMuted?: boolean;
    status: RoomStatus;
    capacity: number;
    creatorId: string;
    creatorUsername: string;
    creatorDisplayName: string;
    allowTips: boolean;
    welcomeMessage?: string;
    isPublic: boolean;
    deepLink: string;
    shareUrl: string;
    hasUnread?: boolean;
    joinedAt?: string;
    lastActivityAt?: string;
};

export type RoomMember = {
    id: string;
    username: string;
    displayName: string;
    isOnline: boolean;
    isMuted: boolean;
    role: RoomRole;
    joinedAt: string;
};

export type RoomChatMessage = {
    id: string;
    roomId: string;
    type: RoomMessageType;
    senderId: string;
    senderUsername: string;
    senderDisplayName: string;
    text: string;
    createdAt: string;
    isPinned?: boolean;
    clientMessageId?: string;
};

export type RoomReaction = {
    id: string;
    roomId: string;
    emoji: string;
    senderUsername: string;
    createdAt: string;
};

export type RoomEntryRequest = {
    entryId: string;
    roomId: string;
    amountGhs: number;
    discountedAmountGhs: number;
    status: RoomAccessStatus;
    roomAccessToken?: string;
    tokenExpiresAt?: string;
    pollUrl?: string;
    codeApplied?: string;
};

export type RoomAccessToken = {
    roomAccessToken: string;
    tokenExpiresAt: string;
    roomId: string;
};

export type RoomCreatorCode = {
    id: string;
    roomId: string;
    label: string;
    code: string;
    discountType: RoomDiscountType;
    discountAmount: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: string | null;
    campus: string | null;
    isActive: boolean;
    createdAt: string;
};

export type RoomCodeApplyResult = {
    codeId: string;
    codeString: string;
    discountType: RoomDiscountType;
    originalFeeGhs: number;
    discountedFeeGhs: number;
    savingsGhs: number;
    proceedAsFree: boolean;
    message: string;
};

export type RoomCodeStats = {
    codeId: string;
    codeString: string;
    usesCount: number;
    maxUses: number | null;
    remainingUses: number | null;
    revenueWaivedGhs: number;
    membersFromCode: number;
    firstUsedAt: string | null;
    lastUsedAt: string | null;
};

export type RoomTipEvent = {
    id: string;
    roomId: string;
    amountGhs: number;
    message: string;
    createdAt: string;
};

export type RoomCreateInput = {
    name: string;
    description: string;
    entryFee: number;
    capacity: number;
    isPublic: boolean;
    allowTips: boolean;
    welcomeMessage?: string;
};

export type RoomUpdateInput = Partial<
    Pick<VipRoom, 'name' | 'description' | 'entryFee' | 'capacity' | 'allowTips' | 'welcomeMessage' | 'isPublic'>
>;

export type RoomMessage = RoomChatMessage;
