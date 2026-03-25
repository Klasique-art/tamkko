import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';

export type PublicUserProfile = {
    id: string;
    username: string;
    displayName: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
};

export const userService = {
    async getMyProfile() {
        const response = await client.get<ApiSuccessResponse<PublicUserProfile>>('/users/me');
        return response.data.data;
    },

    async updateMyProfile(payload: Partial<PublicUserProfile>) {
        const response = await client.patch<ApiSuccessResponse<PublicUserProfile>>('/users/me', payload);
        return response.data.data;
    },

    async getPublicProfile(username: string) {
        const response = await client.get<ApiSuccessResponse<PublicUserProfile>>(`/users/${username}`);
        return response.data.data;
    },

    async followToggle(username: string) {
        const response = await client.post<ApiSuccessResponse<{ following: boolean }>>(`/users/${username}/follow`);
        return response.data.data;
    },

    async getFollowers(username: string) {
        const response = await client.get<ApiSuccessResponse<PublicUserProfile[]>>(`/users/${username}/followers`);
        return response.data.data;
    },

    async getFollowing(username: string) {
        const response = await client.get<ApiSuccessResponse<PublicUserProfile[]>>(`/users/${username}/following`);
        return response.data.data;
    },
};
