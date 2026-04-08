export type VideoVisibility = 'public' | 'followers' | 'subscribers';

export type VideoItem = {
    id: string;
    title: string;
    caption?: string;
    thumbnailUrl?: string;
    playbackUrl?: string;
    videoSource?: number;
    creatorUsername: string;
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
};

export type UploadRequestResponse = {
    videoId: string;
    uploadUrl: string;
    expiresAt: string;
};
