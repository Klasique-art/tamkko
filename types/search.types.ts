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
};
