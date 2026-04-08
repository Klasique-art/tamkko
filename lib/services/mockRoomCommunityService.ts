import {
    mockCreatorCodesByRoomId,
    mockRoomMembersByRoomId,
    mockRoomMessagesByRoomId,
    mockRoomReactionsByRoomId,
    mockRooms,
} from '@/data/mock/rooms';
import { delay } from '@/lib/utils/delay';
import {
    RoomAccessToken,
    RoomChatMessage,
    RoomCodeApplyResult,
    RoomCodeStats,
    RoomCreateInput,
    RoomCreatorCode,
    RoomDiscountType,
    RoomEntryRequest,
    RoomMember,
    RoomReaction,
    RoomTipEvent,
    RoomUpdateInput,
    VipRoom,
} from '@/types/room.types';

const CURRENT_USER = {
    id: 'usr_you',
    username: 'you',
    displayName: 'You',
};

const roomsStore = mockRooms.map((room) => ({ ...room }));
const membersStore: Record<string, RoomMember[]> = Object.fromEntries(
    Object.entries(mockRoomMembersByRoomId).map(([roomId, members]) => [roomId, members.map((member) => ({ ...member }))])
);
const messagesStore: Record<string, RoomChatMessage[]> = Object.fromEntries(
    Object.entries(mockRoomMessagesByRoomId).map(([roomId, messages]) => [roomId, messages.map((message) => ({ ...message }))])
);
const reactionsStore: Record<string, RoomReaction[]> = Object.fromEntries(
    Object.entries(mockRoomReactionsByRoomId).map(([roomId, reactions]) => [roomId, reactions.map((reaction) => ({ ...reaction }))])
);
const codesStore: Record<string, RoomCreatorCode[]> = Object.fromEntries(
    Object.entries(mockCreatorCodesByRoomId).map(([roomId, codes]) => [roomId, codes.map((code) => ({ ...code }))])
);
const tipsStore: Record<string, RoomTipEvent[]> = {};

const entriesStore = new Map<string, RoomEntryRequest>();
const appliedCodeByRoom = new Map<string, string>();
const codeUsageTimeline = new Map<string, { firstUsedAt: string | null; lastUsedAt: string | null }>();

const nowIso = () => new Date().toISOString();

const cloneRoom = (room: VipRoom) => ({ ...room });
const cloneMessage = (message: RoomChatMessage) => ({ ...message });
const cloneMember = (member: RoomMember) => ({ ...member });
const cloneCode = (code: RoomCreatorCode) => ({ ...code });

const listMessages = (roomId: string) => messagesStore[roomId] ?? [];
const listMembers = (roomId: string) => membersStore[roomId] ?? [];
const listCodes = (roomId: string) => codesStore[roomId] ?? [];

const formatRoomAccessToken = (roomId: string) => `rat_${roomId}_${Math.random().toString(36).slice(2, 10)}`;

const makeEntry = (
    roomId: string,
    amountGhs: number,
    discountedAmountGhs: number,
    status: RoomEntryRequest['status'],
    codeApplied?: string
): RoomEntryRequest => {
    const accessToken = status === 'granted' ? formatRoomAccessToken(roomId) : undefined;
    const expiresAt = status === 'granted' ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : undefined;
    const entryId = `entry_${Math.random().toString(36).slice(2, 10)}`;
    return {
        entryId,
        roomId,
        amountGhs,
        discountedAmountGhs,
        status,
        roomAccessToken: accessToken,
        tokenExpiresAt: expiresAt,
        pollUrl: status === 'pending' ? `/api/v1/rooms/${roomId}/access/${entryId}/status` : undefined,
        codeApplied,
    };
};

const findRoom = (roomId: string) => roomsStore.find((room) => room.id === roomId) ?? null;

const updateRoom = (roomId: string, updater: (room: VipRoom) => VipRoom) => {
    const index = roomsStore.findIndex((room) => room.id === roomId);
    if (index < 0) {
        return null;
    }
    const next = updater(roomsStore[index] as VipRoom);
    roomsStore[index] = next;
    return next;
};

const touchRoomActivity = (roomId: string) => {
    updateRoom(roomId, (room) => ({ ...room, lastActivityAt: nowIso() }));
};

const ensureRoomCollections = (roomId: string) => {
    if (!messagesStore[roomId]) {
        messagesStore[roomId] = [];
    }
    if (!membersStore[roomId]) {
        membersStore[roomId] = [];
    }
    if (!reactionsStore[roomId]) {
        reactionsStore[roomId] = [];
    }
    if (!codesStore[roomId]) {
        codesStore[roomId] = [];
    }
    if (!tipsStore[roomId]) {
        tipsStore[roomId] = [];
    }
};

const ensureCurrentUserInMembers = (roomId: string, role: VipRoom['role']) => {
    ensureRoomCollections(roomId);
    const members = membersStore[roomId];
    const existing = members.find((member) => member.id === CURRENT_USER.id);
    if (existing) {
        existing.isOnline = true;
        existing.role = role;
        return;
    }
    members.push({
        id: CURRENT_USER.id,
        username: CURRENT_USER.username,
        displayName: CURRENT_USER.displayName,
        isOnline: true,
        isMuted: false,
        role,
        joinedAt: nowIso(),
    });
};

const clearPinned = (roomId: string) => {
    messagesStore[roomId] = listMessages(roomId).map((message) => ({ ...message, isPinned: false }));
};

const getPinnedMessage = (roomId: string) => listMessages(roomId).find((message) => message.isPinned) ?? null;

const calcDiscountedFee = (originalFee: number, discountType: RoomDiscountType, discountAmount: number) => {
    if (discountType === 'free') {
        return 0;
    }
    if (discountType === 'fixed') {
        return Math.max(0, Number((originalFee - discountAmount).toFixed(2)));
    }
    if (discountType === 'percent') {
        const percentDiscount = originalFee * (discountAmount / 100);
        return Math.max(0, Number((originalFee - percentDiscount).toFixed(2)));
    }
    return originalFee;
};

const roomPreviewSorter = (a: VipRoom, b: VipRoom) => {
    const aTime = new Date(a.lastActivityAt ?? 0).getTime();
    const bTime = new Date(b.lastActivityAt ?? 0).getTime();
    return bTime - aTime;
};

const markCodeUsage = (codeId: string) => {
    const now = nowIso();
    const current = codeUsageTimeline.get(codeId);
    if (!current) {
        codeUsageTimeline.set(codeId, { firstUsedAt: now, lastUsedAt: now });
        return;
    }
    codeUsageTimeline.set(codeId, {
        firstUsedAt: current.firstUsedAt ?? now,
        lastUsedAt: now,
    });
};

export const mockRoomCommunityService = {
    async listPublicRooms() {
        await delay(120);
        return roomsStore.filter((room) => room.isPublic).sort(roomPreviewSorter).map(cloneRoom);
    },

    async listJoinedRooms() {
        await delay(120);
        return roomsStore
            .filter((room) => room.hasJoined)
            .sort(roomPreviewSorter)
            .map((room) => ({ ...cloneRoom(room), hasUnread: Boolean(room.hasUnread) }));
    },

    async listMyCreatorRooms() {
        await delay(120);
        return roomsStore.filter((room) => room.role === 'creator').sort(roomPreviewSorter).map(cloneRoom);
    },

    async getCommunityOverview() {
        await delay(110);
        const publicRooms = roomsStore.filter((room) => room.isPublic);
        const joinedRooms = roomsStore.filter((room) => room.hasJoined);
        const onlineNow = publicRooms.reduce((sum, room) => sum + room.onlineCount, 0);
        return {
            publicRooms: publicRooms.length,
            joinedRooms: joinedRooms.length,
            onlineNow,
            activeCreators: new Set(publicRooms.map((room) => room.creatorId)).size,
        };
    },

    async getRoomById(roomId: string) {
        await delay(90);
        const room = findRoom(roomId);
        if (!room) {
            return null;
        }
        return cloneRoom(room);
    },

    async createRoom(input: RoomCreateInput) {
        await delay(280);
        const roomId = `room_${Math.random().toString(36).slice(2, 8)}`;
        const room: VipRoom = {
            id: roomId,
            name: input.name.trim(),
            description: input.description.trim(),
            entryFee: Number(input.entryFee.toFixed(2)),
            currency: 'GHS',
            onlineCount: 1,
            memberCount: 1,
            role: 'creator',
            hasJoined: true,
            hasPaid: true,
            status: 'active',
            capacity: input.capacity,
            creatorId: CURRENT_USER.id,
            creatorUsername: CURRENT_USER.username,
            creatorDisplayName: CURRENT_USER.displayName,
            allowTips: input.allowTips,
            welcomeMessage: input.welcomeMessage?.trim() || 'Welcome to the room.',
            isPublic: input.isPublic,
            deepLink: `tamkko://room/${roomId}`,
            shareUrl: `https://tamkko.app/room/${roomId}`,
            hasUnread: false,
            joinedAt: nowIso(),
            lastActivityAt: nowIso(),
        };

        roomsStore.unshift(room);
        membersStore[roomId] = [
            {
                id: CURRENT_USER.id,
                username: CURRENT_USER.username,
                displayName: CURRENT_USER.displayName,
                isOnline: true,
                isMuted: false,
                role: 'creator',
                joinedAt: nowIso(),
            },
        ];
        messagesStore[roomId] = [];
        reactionsStore[roomId] = [];
        codesStore[roomId] = [];
        tipsStore[roomId] = [];

        return cloneRoom(room);
    },

    async updateRoomSettings(roomId: string, patch: RoomUpdateInput) {
        await delay(200);
        const updated = updateRoom(roomId, (room) => ({
            ...room,
            ...patch,
            name: patch.name?.trim() || room.name,
            description: patch.description?.trim() || room.description,
            welcomeMessage: patch.welcomeMessage?.trim() || room.welcomeMessage,
            entryFee: typeof patch.entryFee === 'number' ? Number(patch.entryFee.toFixed(2)) : room.entryFee,
            lastActivityAt: nowIso(),
        }));
        return updated ? cloneRoom(updated) : null;
    },

    async closeRoom(roomId: string, closingMessage?: string) {
        await delay(200);
        const updated = updateRoom(roomId, (room) => ({
            ...room,
            status: 'closed',
            onlineCount: 0,
            lastActivityAt: nowIso(),
        }));

        if (!updated) {
            return null;
        }

        if (closingMessage?.trim()) {
            ensureRoomCollections(roomId);
            messagesStore[roomId].push({
                id: `msg_${Math.random().toString(36).slice(2, 10)}`,
                roomId,
                type: 'system_notice',
                senderId: CURRENT_USER.id,
                senderUsername: CURRENT_USER.username,
                senderDisplayName: CURRENT_USER.displayName,
                text: `Room closed: ${closingMessage.trim()}`,
                createdAt: nowIso(),
            });
        }

        return cloneRoom(updated);
    },

    async deleteRoom(roomId: string) {
        await delay(160);
        const roomIndex = roomsStore.findIndex((room) => room.id === roomId);
        if (roomIndex < 0) {
            return false;
        }
        roomsStore.splice(roomIndex, 1);
        delete membersStore[roomId];
        delete messagesStore[roomId];
        delete reactionsStore[roomId];
        delete codesStore[roomId];
        delete tipsStore[roomId];
        appliedCodeByRoom.delete(roomId);
        return true;
    },

    async applyCreatorCode(roomId: string, codeValue: string): Promise<RoomCodeApplyResult | null> {
        await delay(180);
        const room = findRoom(roomId);
        if (!room) {
            return null;
        }

        const normalized = codeValue.trim().toUpperCase();
        const code = listCodes(roomId).find((item) => item.code.toUpperCase() === normalized && item.isActive);

        if (!code) {
            return null;
        }

        if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) {
            return null;
        }

        if (code.maxUses !== null && code.usedCount >= code.maxUses) {
            return null;
        }

        const discountedFeeGhs = calcDiscountedFee(room.entryFee, code.discountType, code.discountAmount);
        const savingsGhs = Number((room.entryFee - discountedFeeGhs).toFixed(2));

        appliedCodeByRoom.set(roomId, code.id);

        return {
            codeId: code.id,
            codeString: code.code,
            discountType: code.discountType,
            originalFeeGhs: room.entryFee,
            discountedFeeGhs,
            savingsGhs,
            proceedAsFree: discountedFeeGhs === 0,
            message:
                discountedFeeGhs === 0
                    ? 'Code applied. You now have free room entry.'
                    : `Code applied. Save GHS ${savingsGhs.toFixed(2)} on entry.`,
        };
    },

    async requestRoomEntry(roomId: string, payload: { momoNumber?: string; codeString?: string } = {}) {
        await delay(260);
        const room = findRoom(roomId);
        if (!room) {
            return null;
        }

        if (room.status !== 'active') {
            return makeEntry(roomId, room.entryFee, room.entryFee, 'failed');
        }

        if (room.memberCount >= room.capacity && !room.hasJoined) {
            return makeEntry(roomId, room.entryFee, room.entryFee, 'failed');
        }

        if (room.hasJoined && (room.role === 'creator' || room.entryFee === 0 || room.hasPaid)) {
            const immediate = makeEntry(roomId, room.entryFee, 0, 'granted');
            entriesStore.set(immediate.entryId, immediate);
            return immediate;
        }

        const appliedCodeId = payload.codeString
            ? (await this.applyCreatorCode(roomId, payload.codeString))?.codeId
            : appliedCodeByRoom.get(roomId);

        const appliedCode = appliedCodeId ? listCodes(roomId).find((item) => item.id === appliedCodeId) : null;
        const discountedAmount = appliedCode
            ? calcDiscountedFee(room.entryFee, appliedCode.discountType, appliedCode.discountAmount)
            : room.entryFee;

        if (discountedAmount === 0 || room.entryFee === 0) {
            const immediate = makeEntry(roomId, room.entryFee, discountedAmount, 'granted', appliedCode?.code);
            entriesStore.set(immediate.entryId, immediate);
            updateRoom(roomId, (current) => ({
                ...current,
                hasJoined: true,
                hasPaid: true,
                memberCount: current.memberCount + 1,
                onlineCount: current.onlineCount + 1,
                joinedAt: current.joinedAt ?? nowIso(),
            }));
            ensureCurrentUserInMembers(roomId, room.role);

            if (appliedCode) {
                appliedCode.usedCount += 1;
                markCodeUsage(appliedCode.id);
            }

            touchRoomActivity(roomId);
            return immediate;
        }

        if (!payload.momoNumber?.trim()) {
            return makeEntry(roomId, room.entryFee, discountedAmount, 'failed');
        }

        const pending = makeEntry(roomId, room.entryFee, discountedAmount, 'pending', appliedCode?.code);
        entriesStore.set(pending.entryId, pending);
        return pending;
    },

    async pollEntryStatus(roomId: string, entryId: string) {
        await delay(220);
        const entry = entriesStore.get(entryId);
        if (!entry || entry.roomId !== roomId) {
            return null;
        }

        if (entry.status !== 'pending') {
            return { ...entry };
        }

        const granted: RoomEntryRequest = {
            ...entry,
            status: 'granted',
            roomAccessToken: formatRoomAccessToken(roomId),
            tokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        };

        entriesStore.set(entryId, granted);

        updateRoom(roomId, (room) => ({
            ...room,
            hasJoined: true,
            hasPaid: true,
            memberCount: room.memberCount + 1,
            onlineCount: room.onlineCount + 1,
            joinedAt: room.joinedAt ?? nowIso(),
            lastActivityAt: nowIso(),
        }));

        ensureCurrentUserInMembers(roomId, 'member');

        if (granted.codeApplied) {
            const code = listCodes(roomId).find((item) => item.code.toUpperCase() === granted.codeApplied?.toUpperCase());
            if (code) {
                code.usedCount += 1;
                markCodeUsage(code.id);
            }
        }

        return { ...granted };
    },

    async getRoomAccessToken(roomId: string): Promise<RoomAccessToken | null> {
        await delay(120);
        const room = findRoom(roomId);
        if (!room) {
            return null;
        }

        const hasAccess = room.role === 'creator' || (room.entryFee === 0 ? room.hasJoined : room.hasJoined && room.hasPaid);
        if (!hasAccess) {
            return null;
        }

        return {
            roomAccessToken: formatRoomAccessToken(roomId),
            tokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            roomId,
        };
    },

    async getRoomMembers(roomId: string) {
        await delay(90);
        return listMembers(roomId).map(cloneMember);
    },

    async getRoomMessages(roomId: string) {
        await delay(90);
        return listMessages(roomId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(cloneMessage);
    },

    async sendMessage(roomId: string, text: string) {
        await delay(110);
        const sanitized = text.trim();
        if (!sanitized) {
            return null;
        }

        const room = findRoom(roomId);
        if (!room || !room.hasJoined) {
            return null;
        }

        if (sanitized.length > 500) {
            return null;
        }

        const you = listMembers(roomId).find((member) => member.id === CURRENT_USER.id);
        if (you?.isMuted) {
            return null;
        }

        const message: RoomChatMessage = {
            id: `msg_${Math.random().toString(36).slice(2, 10)}`,
            roomId,
            type: 'text',
            senderId: CURRENT_USER.id,
            senderUsername: CURRENT_USER.username,
            senderDisplayName: CURRENT_USER.displayName,
            text: sanitized,
            createdAt: nowIso(),
            clientMessageId: `cm_${Math.random().toString(36).slice(2, 10)}`,
        };

        ensureRoomCollections(roomId);
        messagesStore[roomId].push(message);
        touchRoomActivity(roomId);
        return cloneMessage(message);
    },

    async sendReaction(roomId: string, emoji: string) {
        await delay(80);
        const room = findRoom(roomId);
        if (!room || !room.hasJoined) {
            return null;
        }

        const reaction: RoomReaction = {
            id: `reaction_${Math.random().toString(36).slice(2, 10)}`,
            roomId,
            emoji,
            senderUsername: CURRENT_USER.username,
            createdAt: nowIso(),
        };

        ensureRoomCollections(roomId);
        reactionsStore[roomId].push(reaction);
        touchRoomActivity(roomId);
        return { ...reaction };
    },

    async getRecentReactions(roomId: string) {
        await delay(70);
        return (reactionsStore[roomId] ?? []).slice(-20).map((reaction) => ({ ...reaction }));
    },

    async pinMessage(roomId: string, messageId: string) {
        await delay(90);
        clearPinned(roomId);
        messagesStore[roomId] = listMessages(roomId).map((message) =>
            message.id === messageId ? { ...message, isPinned: true } : message
        );
        touchRoomActivity(roomId);
        const pinned = getPinnedMessage(roomId);
        return pinned ? cloneMessage(pinned) : null;
    },

    async deleteMessage(roomId: string, messageId: string) {
        await delay(90);
        const before = listMessages(roomId).length;
        messagesStore[roomId] = listMessages(roomId).filter((message) => message.id !== messageId);
        touchRoomActivity(roomId);
        return before !== messagesStore[roomId].length;
    },

    async muteMember(roomId: string, memberId: string, muted: boolean) {
        await delay(110);
        membersStore[roomId] = listMembers(roomId).map((member) =>
            member.id === memberId ? { ...member, isMuted: muted } : member
        );
        touchRoomActivity(roomId);
        const member = listMembers(roomId).find((item) => item.id === memberId);
        return member ? cloneMember(member) : null;
    },

    async kickMember(roomId: string, memberId: string) {
        await delay(120);
        const before = listMembers(roomId).length;
        membersStore[roomId] = listMembers(roomId).filter((member) => member.id !== memberId);
        const kicked = before !== listMembers(roomId).length;

        if (kicked) {
            updateRoom(roomId, (room) => ({
                ...room,
                memberCount: Math.max(0, room.memberCount - 1),
                onlineCount: Math.max(0, room.onlineCount - 1),
                lastActivityAt: nowIso(),
            }));
        }

        return kicked;
    },

    async leaveRoom(roomId: string) {
        await delay(90);
        membersStore[roomId] = listMembers(roomId).map((member) =>
            member.id === CURRENT_USER.id ? { ...member, isOnline: false } : member
        );
        updateRoom(roomId, (room) => ({
            ...room,
            onlineCount: Math.max(0, room.onlineCount - 1),
            lastActivityAt: nowIso(),
        }));
        return true;
    },

    async sendTip(roomId: string, amountGhs: number, message: string) {
        await delay(200);
        const room = findRoom(roomId);
        if (!room || !room.hasJoined || !room.allowTips) {
            return null;
        }

        ensureRoomCollections(roomId);

        const tip: RoomTipEvent = {
            id: `tip_${Math.random().toString(36).slice(2, 10)}`,
            roomId,
            amountGhs: Number(amountGhs.toFixed(2)),
            message: message.trim(),
            createdAt: nowIso(),
        };

        tipsStore[roomId].push(tip);
        const systemMessage: RoomChatMessage = {
            id: `msg_${Math.random().toString(36).slice(2, 10)}`,
            roomId,
            type: 'system_tip',
            senderId: CURRENT_USER.id,
            senderUsername: CURRENT_USER.username,
            senderDisplayName: CURRENT_USER.displayName,
            text: `sent a GHS ${tip.amountGhs.toFixed(2)} tip${tip.message ? `: ${tip.message}` : '.'}`,
            createdAt: nowIso(),
        };
        messagesStore[roomId].push(systemMessage);
        touchRoomActivity(roomId);

        return {
            tip: { ...tip },
            systemMessage: cloneMessage(systemMessage),
        };
    },

    async generateCreatorCode(
        roomId: string,
        payload: {
            label: string;
            campus: string | null;
            discountType: RoomCreatorCode['discountType'];
            discountAmount: number;
            maxUses: number | null;
            expiresAt: string | null;
        }
    ) {
        await delay(190);
        const code: RoomCreatorCode = {
            id: `code_${Math.random().toString(36).slice(2, 10)}`,
            roomId,
            label: payload.label.trim(),
            code: `TK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            discountType: payload.discountType,
            discountAmount: Number(payload.discountAmount.toFixed(2)),
            maxUses: payload.maxUses,
            usedCount: 0,
            expiresAt: payload.expiresAt,
            campus: payload.campus,
            isActive: true,
            createdAt: nowIso(),
        };

        ensureRoomCollections(roomId);
        codesStore[roomId].unshift(code);
        return cloneCode(code);
    },

    async setCreatorCodeActive(roomId: string, codeId: string, isActive: boolean) {
        await delay(100);
        codesStore[roomId] = listCodes(roomId).map((code) =>
            code.id === codeId ? { ...code, isActive } : code
        );
        const code = listCodes(roomId).find((item) => item.id === codeId);
        return code ? cloneCode(code) : null;
    },

    async listCreatorCodes(roomId: string) {
        await delay(100);
        return listCodes(roomId).map(cloneCode);
    },

    async getCreatorCodeStats(roomId: string, codeId: string): Promise<RoomCodeStats | null> {
        await delay(120);
        const room = findRoom(roomId);
        const code = listCodes(roomId).find((item) => item.id === codeId);
        if (!room || !code) {
            return null;
        }

        const usageMeta = codeUsageTimeline.get(code.id) ?? { firstUsedAt: null, lastUsedAt: null };

        return {
            codeId: code.id,
            codeString: code.code,
            usesCount: code.usedCount,
            maxUses: code.maxUses,
            remainingUses: code.maxUses === null ? null : Math.max(0, code.maxUses - code.usedCount),
            revenueWaivedGhs: Number((code.usedCount * (room.entryFee - calcDiscountedFee(room.entryFee, code.discountType, code.discountAmount))).toFixed(2)),
            membersFromCode: code.usedCount,
            firstUsedAt: usageMeta.firstUsedAt,
            lastUsedAt: usageMeta.lastUsedAt,
        };
    },
};
