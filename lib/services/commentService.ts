import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { VideoComment } from '@/types/comment.types';
import { VideoItem } from '@/types/video.types';

export type CommentItem = {
    id: string;
    videoId: string;
    text: string;
    authorUsername: string;
    createdAt: string;
    likesCount: number;
};

type CommentsApiAuthor = {
    id: string;
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
};

type CommentsApiItem = {
    id: string;
    post_id: string;
    author: CommentsApiAuthor;
    body: string;
    parent_comment_id?: string | null;
    root_comment_id?: string | null;
    is_deleted?: boolean;
    deleted_by?: 'author' | 'post_creator' | 'admin' | null;
    parent_deleted?: boolean;
    liked_by_me?: boolean;
    likes_count?: number;
    replies_count?: number;
    created_at: string;
    updated_at: string;
};

type CommentsListPayload = {
    items: CommentsApiItem[];
    next_cursor: string | null;
    has_more: boolean;
};

const asHandle = (username?: string | null, displayName?: string | null) => {
    const primary = username?.trim() || displayName?.trim() || 'user';
    return primary.startsWith('@') ? primary : `@${primary}`;
};

const mapCommentsApiItem = (item: CommentsApiItem): VideoComment => ({
    id: item.id,
    videoId: item.post_id,
    authorId: item.author?.id,
    authorName: item.author?.display_name ?? undefined,
    authorHandle: asHandle(item.author?.username, item.author?.display_name),
    authorAvatarUrl: item.author?.avatar_url ?? null,
    text: item.body ?? '',
    createdAt: item.created_at,
    likesCount: Number(item.likes_count ?? 0),
    isLiked: Boolean(item.liked_by_me),
    isDeleted: Boolean(item.is_deleted),
    deletedBy: item.deleted_by ?? null,
    parentDeleted: Boolean(item.parent_deleted),
    repliesCount: Number(item.replies_count ?? 0),
    parentCommentId: item.parent_comment_id ?? undefined,
});

export const commentService = {
    async getCommentsPage(
        videoId: string,
        options?: { cursor?: string | null; limit?: number; sort?: 'oldest' | 'newest' }
    ): Promise<{ items: VideoComment[]; nextCursor: string | null; hasMore: boolean }> {
        const response = await client.get<{ status: string; data: CommentsListPayload }>(`/videos/${videoId}/comments`, {
            params: {
                ...(options?.cursor ? { cursor: options.cursor } : {}),
                ...(options?.limit ? { limit: options.limit } : {}),
                ...(options?.sort ? { sort: options.sort } : {}),
            },
        });

        const data = response.data?.data;
        return {
            items: (data?.items ?? []).map(mapCommentsApiItem),
            nextCursor: data?.next_cursor ?? null,
            hasMore: Boolean(data?.has_more),
        };
    },

    async createComment(videoId: string, input: { body: string; parent_comment_id?: string }): Promise<VideoComment> {
        const response = await client.post<{ status: string; data: CommentsApiItem }>(`/videos/${videoId}/comments`, input);
        return mapCommentsApiItem(response.data.data);
    },

    async toggleCommentLike(commentId: string): Promise<{ commentId: string; likedByMe: boolean; likesCount: number }> {
        const response = await client.post<{ status: string; data: { comment_id: string; liked_by_me: boolean; likes_count: number } }>(
            `/videos/comments/${commentId}/like-toggle`
        );
        const data = response.data.data;
        return {
            commentId: data.comment_id,
            likedByMe: Boolean(data.liked_by_me),
            likesCount: Number(data.likes_count ?? 0),
        };
    },

    async deleteComment(commentId: string): Promise<{ commentId: string; isDeleted: boolean; deletedBy: 'author' | 'post_creator' | 'admin' | null }> {
        const response = await client.delete<{ status: string; data: { comment_id: string; is_deleted: boolean; deleted_by: 'author' | 'post_creator' | 'admin' | null } }>(
            `/videos/comments/${commentId}`
        );
        const data = response.data.data;
        return {
            commentId: data.comment_id,
            isDeleted: Boolean(data.is_deleted),
            deletedBy: data.deleted_by ?? null,
        };
    },

    async getVideoComments(videoId: string): Promise<CommentItem[]> {
        const response = await client.get<ApiSuccessResponse<CommentItem[]>>(`/videos/${videoId}/comments`);
        return response.data.data;
    },

    async postComment(videoId: string, text: string): Promise<CommentItem> {
        const response = await client.post<ApiSuccessResponse<CommentItem>>(`/videos/${videoId}/comments`, { text });
        return response.data.data;
    },

    async likeComment(videoId: string, commentId: string): Promise<{ liked: boolean }> {
        const response = await client.post<ApiSuccessResponse<{ liked: boolean }>>(`/videos/${videoId}/comments/${commentId}/like`);
        return response.data.data;
    },

    async getBookmarkedVideos(): Promise<VideoItem[]> {
        const response = await client.get<ApiSuccessResponse<VideoItem[]>>('/users/me/bookmarks');
        return response.data.data;
    },
};
