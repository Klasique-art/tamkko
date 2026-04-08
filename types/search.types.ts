export type SearchSuggestion = {
    id: string;
    label: string;
    type: 'user' | 'hashtag' | 'video';
};

export type SearchUserResult = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    followersCount: number;
    isVerified?: boolean;
};

export type SearchVideoResult = {
    id: string;
    title: string;
    creatorUsername: string;
    viewsCount: number;
    likesCount: number;
    durationSeconds: number;
};

export type SearchHashtagResult = {
    id: string;
    tag: string;
    postsCount: number;
    growthLabel: string;
};

export type SearchResultsBundle = {
    users: SearchUserResult[];
    videos: SearchVideoResult[];
    hashtags: SearchHashtagResult[];
};

