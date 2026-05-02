import { generateCommentsForVideo, mockCommentsByVideo } from '@/data/mock/comments';
import { delay } from '@/lib/utils/delay';
import { VideoComment } from '@/types/comment.types';

const cloneStore = () =>
    Object.entries(mockCommentsByVideo).reduce<Record<string, VideoComment[]>>((acc, [videoId, comments]) => {
        acc[videoId] = comments.map((item) => ({ ...item }));
        return acc;
    }, {});

const store: Record<string, VideoComment[]> = cloneStore();

const ensureReplyPrefix = (text: string, handle: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith(`${handle} `) || trimmed === handle) {
        return trimmed;
    }
    return `${handle} ${trimmed}`.trim();
};

const insertReplyUnderParent = (comments: VideoComment[], reply: VideoComment, parentCommentId: string) => {
    const parentIndex = comments.findIndex((comment) => comment.id === parentCommentId);
    if (parentIndex < 0) {
        return [reply, ...comments];
    }

    let insertIndex = parentIndex + 1;
    while (insertIndex < comments.length && comments[insertIndex]?.parentCommentId === parentCommentId) {
        insertIndex += 1;
    }

    return [...comments.slice(0, insertIndex), reply, ...comments.slice(insertIndex)];
};

export const mockCommentThreadService = {
    async getComments(videoId: string): Promise<VideoComment[]> {
        await delay(110);
        if (!store[videoId]) {
            store[videoId] = generateCommentsForVideo(videoId, 14);
        }
        return [...(store[videoId] ?? [])];
    },

    async postComment(input: {
        videoId: string;
        text: string;
        parentCommentId?: string;
        replyToHandle?: string;
    }): Promise<VideoComment> {
        await delay(220);
        const now = new Date().toISOString();
        const normalizedText = input.replyToHandle ? ensureReplyPrefix(input.text, input.replyToHandle) : input.text.trim();

        const newComment: VideoComment = {
            id: `${input.videoId}_local_${Date.now()}`,
            videoId: input.videoId,
            authorHandle: '@you',
            authorAvatarUrl: null,
            text: normalizedText,
            createdAt: now,
            likesCount: 0,
            isLiked: false,
            parentCommentId: input.parentCommentId,
            replyToHandle: input.replyToHandle,
        };

        const current = store[input.videoId] ?? [];
        store[input.videoId] = input.parentCommentId
            ? insertReplyUnderParent(current, newComment, input.parentCommentId)
            : [newComment, ...current];

        return newComment;
    },

    async toggleLike(videoId: string, commentId: string): Promise<VideoComment | null> {
        const current = store[videoId] ?? [];
        const target = current.find((item) => item.id === commentId);
        if (!target) return null;

        await delay(120);
        const nextLiked = !target.isLiked;
        const nextCount = Math.max(0, target.likesCount + (nextLiked ? 1 : -1));
        target.isLiked = nextLiked;
        target.likesCount = nextCount;
        return { ...target };
    },
};
