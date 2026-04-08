import { mockCreatorProfiles } from '@/data/mock/creators';
import { mockSearchRecentQueries, mockSearchTrendingHashtags } from '@/data/mock/search';
import { mockVideos } from '@/data/mock/videos';
import {
    SearchHashtagResult,
    SearchResultsBundle,
    SearchSuggestion,
    SearchUserResult,
    SearchVideoResult,
} from '@/types/search.types';

const toLower = (value: string) => value.trim().toLowerCase();

const includesQuery = (haystack: string, query: string) => toLower(haystack).includes(toLower(query));

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

const creatorUsers: SearchUserResult[] = mockCreatorProfiles.map((creator, index) => ({
    id: creator.id,
    username: `@${creator.username.replace(/^@/, '')}`,
    displayName: creator.displayName,
    avatarUrl: creator.avatarUrl,
    followersCount: creator.followersCount,
    isVerified: index < 2,
}));

const baseVideoViews: Record<string, number> = {
    vid_001: 202400,
    vid_002: 118200,
    vid_003: 90200,
    vid_004: 133400,
    vid_005: 145900,
    vid_006: 109100,
};

const toVideoResult = (): SearchVideoResult[] =>
    mockVideos.map((video, index) => ({
        id: video.id,
        title: video.title,
        creatorUsername: video.creatorUsername,
        likesCount: video.likesCount,
        viewsCount: baseVideoViews[video.id] ?? Math.max(1500, video.likesCount * 14),
        durationSeconds: 26 + ((index * 7) % 38),
    }));

const toHashtagPool = (): SearchHashtagResult[] => {
    const fromCaptions = mockVideos.map((video) => ({
        id: `tag_auto_${video.id}`,
        tag: video.title.toLowerCase().replace(/\s+/g, ''),
        postsCount: Math.max(5000, Math.round(video.likesCount * 18)),
        growthLabel: `+${10 + (video.likesCount % 35)}% this week`,
    }));
    return [...mockSearchTrendingHashtags, ...fromCaptions];
};

const filterUsers = (query: string) => {
    if (!query.trim()) return creatorUsers;
    return creatorUsers.filter(
        (user) => includesQuery(user.username, query) || includesQuery(user.displayName, query)
    );
};

const filterVideos = (query: string) => {
    const all = toVideoResult();
    if (!query.trim()) return all;
    return all.filter(
        (video) =>
            includesQuery(video.title, query) ||
            includesQuery(video.creatorUsername, query)
    );
};

const filterHashtags = (query: string) => {
    const all = toHashtagPool();
    if (!query.trim()) return all;
    return all.filter((hashtag) => includesQuery(hashtag.tag, query));
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const searchService = {
    compactCount(value: number) {
        return compact.format(value);
    },

    async getTypeaheadSuggestions(query: string): Promise<SearchSuggestion[]> {
        if (!query.trim()) return [];
        await delay(90);
        const userSuggestions = filterUsers(query)
            .slice(0, 4)
            .map((user) => ({ id: `s_user_${user.id}`, label: user.username, type: 'user' as const }));
        const hashtagSuggestions = filterHashtags(query)
            .slice(0, 3)
            .map((tag) => ({ id: `s_tag_${tag.id}`, label: `#${tag.tag}`, type: 'hashtag' as const }));
        const videoSuggestions = filterVideos(query)
            .slice(0, 3)
            .map((video) => ({ id: `s_vid_${video.id}`, label: video.title, type: 'video' as const }));
        return [...userSuggestions, ...hashtagSuggestions, ...videoSuggestions].slice(0, 8);
    },

    async searchAll(query: string): Promise<SearchResultsBundle> {
        await delay(120);
        return {
            users: filterUsers(query).slice(0, 12),
            videos: filterVideos(query).slice(0, 18),
            hashtags: filterHashtags(query).slice(0, 12),
        };
    },

    async searchUsers(query: string): Promise<SearchUserResult[]> {
        await delay(100);
        return filterUsers(query).slice(0, 32);
    },

    async searchVideos(query: string): Promise<SearchVideoResult[]> {
        await delay(100);
        return filterVideos(query).slice(0, 48);
    },

    async searchHashtags(query: string): Promise<SearchHashtagResult[]> {
        await delay(100);
        return filterHashtags(query).slice(0, 48);
    },

    async getTrendingHashtags(): Promise<SearchHashtagResult[]> {
        await delay(100);
        return mockSearchTrendingHashtags;
    },

    getRecentQueries() {
        return mockSearchRecentQueries;
    },
};
