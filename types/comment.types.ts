export type VideoComment = {
    id: string;
    videoId: string;
    authorHandle: string;
    text: string;
    createdAt: string;
    likesCount: number;
    isLiked?: boolean;
    parentCommentId?: string;
    replyToHandle?: string;
};
