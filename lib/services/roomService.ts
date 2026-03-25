import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { RoomMessage, VipRoom } from '@/types/room.types';

export const roomService = {
    async getRoom(roomId: string): Promise<VipRoom> {
        const response = await client.get<ApiSuccessResponse<VipRoom>>(`/rooms/${roomId}`);
        return response.data.data;
    },

    async listCreatorRooms(username: string): Promise<VipRoom[]> {
        const response = await client.get<ApiSuccessResponse<VipRoom[]>>(`/users/${username}/rooms`);
        return response.data.data;
    },

    async listJoinedRooms(): Promise<VipRoom[]> {
        const response = await client.get<ApiSuccessResponse<VipRoom[]>>('/rooms/joined');
        return response.data.data;
    },

    async createRoom(payload: { name: string; description: string; entry_fee: number; capacity: number }) {
        const response = await client.post<ApiSuccessResponse<VipRoom>>('/rooms', payload);
        return response.data.data;
    },

    async getRoomMembers(roomId: string) {
        const response = await client.get<ApiSuccessResponse<Array<{ userId: string; username: string; online: boolean }>>>(
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
