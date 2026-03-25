import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { UploadRequestResponse, VideoItem } from '@/types/video.types';

export const videoService = {
    async getForYouFeed(): Promise<VideoItem[]> {
        const response = await client.get<ApiSuccessResponse<VideoItem[]>>('/feed/for-you');
        return response.data.data;
    },

    async getFollowingFeed(): Promise<VideoItem[]> {
        const response = await client.get<ApiSuccessResponse<VideoItem[]>>('/feed/following');
        return response.data.data;
    },

    async getTrendingFeed(): Promise<VideoItem[]> {
        const response = await client.get<ApiSuccessResponse<VideoItem[]>>('/feed/trending');
        return response.data.data;
    },

    async getVideo(videoId: string): Promise<VideoItem> {
        const response = await client.get<ApiSuccessResponse<VideoItem>>(`/videos/${videoId}`);
        return response.data.data;
    },

    async requestUploadUrl(payload: { fileName: string; mimeType: string }): Promise<UploadRequestResponse> {
        const response = await client.post<ApiSuccessResponse<UploadRequestResponse>>('/videos/upload/request', payload);
        return response.data.data;
    },
};
