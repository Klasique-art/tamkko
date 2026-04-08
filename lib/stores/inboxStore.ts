import { create } from 'zustand';

import { normalizeCreatorHandle } from '@/data/mock/following';
import { DirectMessage, InboxConversation } from '@/types/inbox.types';

type EnsureConversationInput = {
    creatorUsername: string;
    creatorDisplayName: string;
    creatorAvatarUrl: string;
    isVerified?: boolean;
};

type InboxState = {
    conversations: InboxConversation[];
    messagesByConversation: Record<string, DirectMessage[]>;
    activeConversationId: string | null;
    ensureConversation: (input: EnsureConversationInput) => string;
    sendMessage: (conversationId: string, text: string) => void;
    markConversationRead: (conversationId: string) => void;
    setActiveConversation: (conversationId: string | null) => void;
};

const cannedReplies = [
    'Love this. I am prepping fresh content this week.',
    'Thanks for the message. What kind of video do you want next?',
    'Appreciate you being here. I will share more behind-the-scenes soon.',
    'Great question. I can do a quick breakdown in my next post.',
    'Thanks for supporting. See you in the next drop.',
];

const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const sortConversations = (list: InboxConversation[]) =>
    [...list].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

const buildReply = (creatorDisplayName: string, originalText: string) => {
    if (/hello|hi|hey/i.test(originalText)) return `Hey, it is ${creatorDisplayName}. Great to hear from you.`;
    if (/price|subscribe|subscription/i.test(originalText)) return 'Subscription unlocks all premium uploads monthly.';
    if (/collab|collaboration/i.test(originalText)) return 'Collab idea sounds good. Send more details.';
    return cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
};

export const useInboxStore = create<InboxState>((set, get) => ({
    conversations: [],
    messagesByConversation: {},
    activeConversationId: null,

    ensureConversation: (input) => {
        const creatorHandle = normalizeCreatorHandle(input.creatorUsername);
        const existing = get().conversations.find((conversation) => conversation.creatorHandle === creatorHandle);
        if (existing) return existing.id;

        const now = new Date().toISOString();
        const conversationId = makeId('conv');
        const created: InboxConversation = {
            id: conversationId,
            creatorHandle,
            creatorUsername: creatorHandle.replace(/^@/, ''),
            creatorDisplayName: input.creatorDisplayName,
            creatorAvatarUrl: input.creatorAvatarUrl,
            isVerified: Boolean(input.isVerified),
            lastMessage: 'Start a conversation',
            lastMessageAt: now,
            unreadCount: 0,
        };

        set((state) => ({
            conversations: sortConversations([created, ...state.conversations]),
            messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: [],
            },
        }));

        return conversationId;
    },

    sendMessage: (conversationId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const now = new Date().toISOString();
        const sent: DirectMessage = {
            id: makeId('msg'),
            conversationId,
            sender: 'me',
            text: trimmed,
            createdAt: now,
        };

        set((state) => {
            const conversation = state.conversations.find((item) => item.id === conversationId);
            if (!conversation) return state;

            return {
                conversations: sortConversations(
                    state.conversations.map((item) =>
                        item.id === conversationId
                            ? {
                                ...item,
                                lastMessage: trimmed,
                                lastMessageAt: now,
                            }
                            : item
                    )
                ),
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), sent],
                },
            };
        });

        const replyDelay = 900 + Math.floor(Math.random() * 1200);
        setTimeout(() => {
            const state = get();
            const conversation = state.conversations.find((item) => item.id === conversationId);
            if (!conversation) return;

            const replyText = buildReply(conversation.creatorDisplayName, trimmed);
            const replyAt = new Date().toISOString();
            const reply: DirectMessage = {
                id: makeId('msg'),
                conversationId,
                sender: 'creator',
                text: replyText,
                createdAt: replyAt,
            };

            set((next) => ({
                conversations: sortConversations(
                    next.conversations.map((item) =>
                        item.id === conversationId
                            ? {
                                ...item,
                                lastMessage: replyText,
                                lastMessageAt: replyAt,
                                unreadCount:
                                    next.activeConversationId === conversationId ? 0 : item.unreadCount + 1,
                            }
                            : item
                    )
                ),
                messagesByConversation: {
                    ...next.messagesByConversation,
                    [conversationId]: [...(next.messagesByConversation[conversationId] ?? []), reply],
                },
            }));
        }, replyDelay);
    },

    markConversationRead: (conversationId) => {
        set((state) => ({
            conversations: state.conversations.map((item) =>
                item.id === conversationId ? { ...item, unreadCount: 0 } : item
            ),
        }));
    },

    setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        if (conversationId) {
            get().markConversationRead(conversationId);
        }
    },
}));
