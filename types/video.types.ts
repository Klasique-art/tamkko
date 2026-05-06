export type VideoVisibility = 'public' | 'followers' | 'subscribers';
export type VideoPostVisibility = 'public' | 'premium' | 'followers_only' | 'private';

export type VideoItem = {
    id: string;
    title: string;
    mediaType?: 'video' | 'image';
    caption?: string;
    thumbnailUrl?: string;
    playbackUrl?: string;
    videoSource?: number | { uri: string };
    creatorUsername: string;
    viewsCount?: number;
    likesCount: number;
    commentsCount: number;
    sharesCount?: number;
    allowComments?: boolean;
    postVisibility?: VideoPostVisibility;
    createdAt?: string;
    isLiked?: boolean;
    isBookmarked?: boolean;
};

export type UploadRequestResponse = {
    videoId: string;
    uploadUrl: string;
    expiresAt: string;
};
