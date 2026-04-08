export type DirectMessageSender = 'me' | 'creator';

export type DirectMessage = {
    id: string;
    conversationId: string;
    sender: DirectMessageSender;
    text: string;
    createdAt: string;
};

export type InboxConversation = {
    id: string;
    creatorHandle: string;
    creatorUsername: string;
    creatorDisplayName: string;
    creatorAvatarUrl: string;
    isVerified: boolean;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
};
