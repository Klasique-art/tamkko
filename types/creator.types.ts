export type CreatorAccessModel = 'subscription_only';

export type CreatorProfile = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    location: string;
    followersCount: number;
    likesCount: number;
    videosCount: number;
    monthlySubscriptionPriceGhs: number;
    viewerHasActiveSubscription: boolean;
    accessModel: CreatorAccessModel;
};

export type CreatorVideoVisibility = 'free' | 'locked';

export type CreatorProfileVideo = {
    id: string;
    creatorId: string;
    title: string;
    thumbnailUrl: string;
    likesCount: number;
    viewsCount: number;
    durationSeconds: number;
    createdAt: string;
    visibility: CreatorVideoVisibility;
};

export type CreatorProfileScreenData = {
    profile: CreatorProfile;
    freeVideos: CreatorProfileVideo[];
    lockedVideos: CreatorProfileVideo[];
};
