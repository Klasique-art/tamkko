export type VideoComment = {
    id: string;
    videoId: string;
    authorId?: string;
    authorName?: string;
    authorHandle: string;
    authorAvatarUrl?: string | null;
    text: string;
    createdAt: string;
    likesCount: number;
    isLiked?: boolean;
    isDeleted?: boolean;
    deletedBy?: 'author' | 'post_creator' | 'admin' | null;
    parentDeleted?: boolean;
    repliesCount?: number;
    parentCommentId?: string;
    replyToHandle?: string;
};
