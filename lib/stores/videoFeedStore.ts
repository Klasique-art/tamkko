import { create } from 'zustand';

import { mockVideos, MOCK_TEST_VIDEO_SOURCE } from '@/data/mock/videos';
import { CreateDraft } from '@/types/create.types';
import { VideoItem, VideoPostVisibility } from '@/types/video.types';

type AddCreatedPostInput = {
    draft: CreateDraft;
    creatorUsername: string;
};

type VideoFeedState = {
    videos: VideoItem[];
    addCreatedPost: (input: AddCreatedPostInput) => VideoItem | null;
    updateVideo: (videoId: string, patch: Partial<Pick<VideoItem, 'title' | 'caption' | 'allowComments' | 'postVisibility'>>) => VideoItem | null;
    toggleBookmark: (videoId: string) => VideoItem | null;
    getVideoById: (videoId: string) => VideoItem | null;
    deleteVideo: (videoId: string) => boolean;
};

const mapCreateVisibilityToPostVisibility = (value: CreateDraft['visibility']): VideoPostVisibility => {
    switch (value) {
        case 'premium':
            return 'premium';
        case 'followers_only':
            return 'followers_only';
        case 'private':
            return 'private';
        case 'public':
        default:
            return 'public';
    }
};

const normalizeCreatorHandle = (raw: string) => {
    const trimmed = raw.trim().replace(/^@+/, '');
    if (!trimmed) return '@creator';
    return `@${trimmed.toLowerCase().replace(/\s+/g, '.')}`;
};

export const useVideoFeedStore = create<VideoFeedState>((set, get) => ({
    videos: [...mockVideos],
    addCreatedPost: ({ draft, creatorUsername }) => {
        if (!draft.media) return null;

        const now = new Date();
        const id = `vid_post_${now.getTime()}`;
        const title = draft.caption.trim().slice(0, 42) || 'New post';
        const postVisibility = mapCreateVisibilityToPostVisibility(draft.visibility);
        const nextPost: VideoItem = {
            id,
            title,
            caption: draft.caption.trim() || undefined,
            creatorUsername: normalizeCreatorHandle(creatorUsername),
            thumbnailUrl: draft.media.thumbnailUri ?? 'local-test-video',
            videoSource:
                draft.media.type === 'video' && draft.media.uri
                    ? { uri: draft.media.uri }
                    : MOCK_TEST_VIDEO_SOURCE,
            likesCount: 0,
            commentsCount: 0,
            allowComments: draft.allowComments,
            postVisibility,
            createdAt: now.toISOString(),
            isLiked: false,
            isBookmarked: false,
        };

        set({
            videos: [nextPost, ...get().videos],
        });

        return nextPost;
    },
    updateVideo: (videoId, patch) => {
        let updated: VideoItem | null = null;
        set({
            videos: get().videos.map((item) => {
                if (item.id !== videoId) return item;
                updated = { ...item, ...patch };
                return updated;
            }),
        });
        return updated;
    },
    toggleBookmark: (videoId) => {
        let updated: VideoItem | null = null;
        set({
            videos: get().videos.map((item) => {
                if (item.id !== videoId) return item;
                updated = { ...item, isBookmarked: !item.isBookmarked };
                return updated;
            }),
        });
        return updated;
    },
    getVideoById: (videoId) => get().videos.find((item) => item.id === videoId) ?? null,
    deleteVideo: (videoId) => {
        const before = get().videos.length;
        set({
            videos: get().videos.filter((item) => item.id !== videoId),
        });
        return get().videos.length < before;
    },
}));

export const getVideoFeedItems = () => useVideoFeedStore.getState().videos;
