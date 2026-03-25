import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { VideoItem } from '@/types/video.types';

export type CommentItem = {
    id: string;
    videoId: string;
    text: string;
    authorUsername: string;
    createdAt: string;
    likesCount: number;
};

export const commentService = {
    async getVideoComments(videoId: string): Promise<CommentItem[]> {
        const response = await client.get<ApiSuccessResponse<CommentItem[]>>(`/videos/${videoId}/comments`);
        return response.data.data;
    },

    async postComment(videoId: string, text: string): Promise<CommentItem> {
        const response = await client.post<ApiSuccessResponse<CommentItem>>(`/videos/${videoId}/comments`, { text });
        return response.data.data;
    },

    async likeComment(videoId: string, commentId: string): Promise<{ liked: boolean }> {
        const response = await client.post<ApiSuccessResponse<{ liked: boolean }>>(
            `/videos/${videoId}/comments/${commentId}/like`
        );
        return response.data.data;
    },

    async getBookmarkedVideos(): Promise<VideoItem[]> {
        const response = await client.get<ApiSuccessResponse<VideoItem[]>>('/users/me/bookmarks');
        return response.data.data;
    },
};
