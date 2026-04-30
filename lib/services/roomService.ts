import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { RoomMessage, VipRoom } from '@/types/room.types';

const VIP_ROOMS_BASE = '/vip/rooms';

const normalizeRoom = (raw: any): VipRoom => {
    const id = String(raw?.id ?? raw?._id ?? '');
    const creatorUsername = String(raw?.creatorUsername ?? raw?.creator_username ?? raw?.creator?.username ?? 'creator');
    const creatorDisplayName = String(
        raw?.creatorDisplayName ?? raw?.creator_display_name ?? raw?.creator?.display_name ?? creatorUsername
    );
    const entryFee =
        Number(raw?.entryFee ?? raw?.entry_fee_ghs ?? raw?.monthlyFee ?? raw?.monthly_fee_ghs ?? raw?.entry_fee ?? 0) || 0;

    return {
        id,
        name: String(raw?.name ?? 'Untitled Room'),
        description: String(raw?.description ?? ''),
        entryFee,
        currency: String(raw?.currency ?? 'GHS'),
        onlineCount: Number(raw?.onlineCount ?? raw?.online_count ?? 0) || 0,
        memberCount: Number(raw?.memberCount ?? raw?.member_count ?? 0) || 0,
        role: (raw?.role ?? 'member') as VipRoom['role'],
        hasJoined: Boolean(raw?.hasJoined ?? raw?.has_joined ?? false),
        hasPaid: Boolean(raw?.hasPaid ?? raw?.has_paid ?? entryFee === 0),
        isMuted: Boolean(raw?.isMuted ?? raw?.is_muted ?? false),
        status: (raw?.status ?? 'active') as VipRoom['status'],
        capacity: Number(raw?.capacity ?? 0) || 0,
        creatorId: String(raw?.creatorId ?? raw?.creator_id ?? raw?.creator ?? ''),
        creatorUsername,
        creatorDisplayName,
        allowTips: Boolean(raw?.allowTips ?? raw?.allow_tips ?? true),
        welcomeMessage: raw?.welcomeMessage ?? raw?.welcome_message ?? '',
        isPublic: Boolean(raw?.isPublic ?? raw?.is_public ?? true),
        deepLink: String(raw?.deepLink ?? raw?.deep_link ?? ''),
        shareUrl: String(raw?.shareUrl ?? raw?.share_url ?? ''),
        hasUnread: Boolean(raw?.hasUnread ?? raw?.has_unread ?? false),
        joinedAt: raw?.joinedAt ?? raw?.joined_at ?? undefined,
        lastActivityAt: raw?.lastActivityAt ?? raw?.last_activity_at ?? raw?.updatedAt ?? raw?.updated_at ?? undefined,
    };
};

export const roomService = {
    async getRoom(roomId: string): Promise<VipRoom> {
        const response = await client.get<any>(`${VIP_ROOMS_BASE}/${roomId}`);
        const data = response.data?.data ?? response.data;
        const room = data?.room ?? data;
        return normalizeRoom(room);
    },

    async listPublicRooms(params?: { query?: string; cursor?: string; limit?: number }): Promise<{ rooms: VipRoom[]; nextCursor: string | null }> {
        const response = await client.get<any>(VIP_ROOMS_BASE, {
            params: {
                scope: 'public',
                q: params?.query,
                query: params?.query,
                cursor: params?.cursor,
                limit: params?.limit ?? 20,
            },
        });
        const data = response.data?.data ?? response.data ?? {};
        const list = data?.rooms ?? data?.results ?? data?.items ?? [];
        return {
            rooms: Array.isArray(list) ? list.map(normalizeRoom) : [],
            nextCursor: data?.next_cursor ?? data?.nextCursor ?? null,
        };
    },

    async listJoinedRooms(params?: { cursor?: string; limit?: number; query?: string }): Promise<{ rooms: VipRoom[]; nextCursor: string | null }> {
        const response = await client.get<any>(`${VIP_ROOMS_BASE}/joined`, {
            params: { cursor: params?.cursor, limit: params?.limit ?? 20, q: params?.query, query: params?.query ?? '' },
        });
        const data = response.data?.data ?? response.data ?? {};
        const list = data?.rooms ?? data?.results ?? data?.items ?? [];
        return {
            rooms: Array.isArray(list) ? list.map(normalizeRoom) : [],
            nextCursor: data?.next_cursor ?? data?.nextCursor ?? null,
        };
    },

    async listMyCreatorRooms(params?: { cursor?: string; limit?: number; query?: string }): Promise<{ rooms: VipRoom[]; nextCursor: string | null }> {
        const response = await client.get<any>(`${VIP_ROOMS_BASE}/mine`, {
            params: {
                'query[limit]': params?.limit ?? 20,
                'query[cursor]': params?.cursor,
                'query[q]': params?.query ?? '',
            },
        });
        const data = response.data?.data ?? response.data ?? {};
        const list = data?.rooms ?? data?.results ?? data?.items ?? [];
        return {
            rooms: Array.isArray(list) ? list.map(normalizeRoom) : [],
            nextCursor: data?.next_cursor ?? data?.nextCursor ?? null,
        };
    },

    async createRoom(payload: {
        name: string;
        description: string;
        entry_fee_ghs: string;
        is_public: boolean;
        allow_tips: boolean;
        welcome_message?: string;
    }): Promise<VipRoom> {
        const response = await client.post<any>(VIP_ROOMS_BASE, payload);
        const data = response.data?.data ?? response.data;
        const room = data?.room ?? data;
        return normalizeRoom(room);
    },

    async updateRoom(
        roomId: string,
        payload: {
            name?: string;
            description?: string;
            entry_fee_ghs?: string;
            is_public?: boolean;
            allow_tips?: boolean;
            welcome_message?: string;
        }
    ): Promise<VipRoom> {
        const response = await client.patch<any>(`${VIP_ROOMS_BASE}/${roomId}`, payload);
        const data = response.data?.data ?? response.data;
        const room = data?.room ?? data;
        return normalizeRoom(room);
    },

    async joinRoom(roomId: string, payload?: { code_string?: string }) {
        const response = await client.post<any>(`${VIP_ROOMS_BASE}/${roomId}/join`, payload ?? {});
        const data = response.data?.data ?? response.data ?? {};
        return {
            joined: Boolean(data?.joined ?? false),
            message: data?.message ? String(data.message) : undefined,
            room: data?.room ? normalizeRoom(data.room) : undefined,
            paymentRequired: Boolean(data?.payment_required ?? false),
            originalAmount: Number(data?.original_amount_ghs ?? 0) || 0,
            payableAmount: Number(data?.payable_amount_ghs ?? 0) || 0,
            discountAmount: Number(data?.discount_amount_ghs ?? 0) || 0,
            codeApplied: data?.code_applied ? String(data.code_applied) : undefined,
        };
    },

    async previewPromoCode(roomId: string, code_string: string) {
        const response = await client.post<any>(`${VIP_ROOMS_BASE}/${roomId}/promo-code/preview`, { code_string });
        const data = response.data?.data ?? response.data ?? {};
        return {
            valid: Boolean(data?.valid ?? true),
            message: data?.message ? String(data.message) : 'Promo code applied.',
            codeString: String(data?.code_string ?? code_string),
            originalAmount: Number(data?.original_amount_ghs ?? 0) || 0,
            discountAmount: Number(data?.discount_amount_ghs ?? 0) || 0,
            payableAmount: Number(data?.payable_amount_ghs ?? 0) || 0,
        };
    },

    async deleteRoom(roomId: string) {
        const response = await client.delete<any>(`${VIP_ROOMS_BASE}/${roomId}`);
        const data = response.data?.data ?? response.data ?? {};
        return Boolean(data?.deleted ?? true);
    },

    async createAccessPass(payload: {
        room_id: string;
        label: string;
        campus?: string | null;
        discount_type: 'free' | 'fixed' | 'percent';
        discount_amount_ghs: number | null;
        max_uses: number | null;
        expires_at?: string | null;
        is_active?: boolean;
    }) {
        const response = await client.post<ApiSuccessResponse<{ access_pass: unknown }>>('/vip/rooms/access-passes', payload);
        return response.data.data;
    },
    async listAccessPasses(roomId: string) {
        const response = await client.get<any>(`${VIP_ROOMS_BASE}/${encodeURIComponent(roomId)}/access-passes`);
        const data = response.data?.data ?? response.data ?? {};
        const list = data?.access_passes ?? data?.passes ?? data?.items ?? [];
        return Array.isArray(list) ? list : [];
    },

    async updateAccessPass(
        passId: string,
        payload: {
            label?: string;
            campus?: string | null;
            discount_type?: 'free' | 'fixed' | 'percent';
            discount_amount_ghs?: number | null;
            max_uses?: number | null;
            expires_at?: string | null;
            is_active?: boolean;
        }
    ) {
        const response = await client.patch<ApiSuccessResponse<{ access_pass: unknown }>>(
            `/vip/rooms/access-passes/${encodeURIComponent(passId)}`,
            payload
        );
        return response.data.data;
    },

    async deleteAccessPass(passId: string) {
        const response = await client.delete<ApiSuccessResponse<{ deleted: boolean }>>(
            `/vip/rooms/access-passes/${encodeURIComponent(passId)}`
        );
        return Boolean(response.data?.data?.deleted ?? true);
    },

    async getRoomMembers(roomId: string) {
        const response = await client.get<ApiSuccessResponse<{ userId: string; username: string; online: boolean }[]>>(
            `/rooms/${roomId}/members`
        );
        return response.data.data;
    },

    async sendRoomTip(roomId: string, payload: { amount: number; phoneNumber: string }) {
        const response = await client.post<ApiSuccessResponse<{ tipId: string; status: string }>>(`/rooms/${roomId}/tips`, payload);
        return response.data.data;
    },

    async getRoomMessages(roomId: string): Promise<RoomMessage[]> {
        const response = await client.get<ApiSuccessResponse<RoomMessage[]>>(`/rooms/${roomId}`);
        return response.data.data;
    },
};
