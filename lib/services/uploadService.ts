import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';

export const uploadService = {
    async requestUpload(payload: { file_name: string; mime_type: string }) {
        const response = await client.post<ApiSuccessResponse<{ videoId: string; uploadUrl: string }>>(
            '/videos/upload/request',
            payload
        );
        return response.data.data;
    },

    async confirmUpload(videoId: string, payload: { title: string; caption?: string; hashtags?: string[]; visibility: string }) {
        const response = await client.post<ApiSuccessResponse<{ videoId: string; status: string }>>(
            `/videos/${videoId}/upload/confirm`,
            payload
        );
        return response.data.data;
    },

    async getUploadStatus(videoId: string) {
        const response = await client.get<ApiSuccessResponse<{ status: 'processing' | 'ready' | 'error' }>>(`/videos/${videoId}/status`);
        return response.data.data;
    },
};
