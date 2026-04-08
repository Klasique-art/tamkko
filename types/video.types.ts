export type VideoVisibility = 'public' | 'followers' | 'subscribers';
export type VideoPostVisibility = 'public' | 'premium' | 'followers_only' | 'private';

export type VideoItem = {
    id: string;
    title: string;
    caption?: string;
    thumbnailUrl?: string;
    playbackUrl?: string;
    videoSource?: number | { uri: string };
    creatorUsername: string;
    likesCount: number;
    commentsCount: number;
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
