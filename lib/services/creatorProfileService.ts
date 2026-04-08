import { mockCreatorProfiles, mockCreatorVideos } from '@/data/mock/creators';
import { CreatorProfile, CreatorProfileScreenData, CreatorProfileVideo } from '@/types/creator.types';

const normalizeUsername = (username: string) => username.replace(/^@/, '').trim().toLowerCase();

const byMostRecent = (a: CreatorProfileVideo, b: CreatorProfileVideo) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const creatorProfileService = {
    async getCreatorProfileByUsername(username: string): Promise<CreatorProfile | null> {
        const normalized = normalizeUsername(username);
        const profile = mockCreatorProfiles.find((item) => item.username.toLowerCase() === normalized);
        return profile ?? null;
    },

    async getCreatorVideosByCreatorId(creatorId: string): Promise<CreatorProfileVideo[]> {
        return mockCreatorVideos
            .filter((video) => video.creatorId === creatorId)
            .sort(byMostRecent);
    },

    async getCreatorProfileScreenData(username: string): Promise<CreatorProfileScreenData | null> {
        const profile = await this.getCreatorProfileByUsername(username);
        if (!profile) return null;

        const videos = await this.getCreatorVideosByCreatorId(profile.id);
        return {
            profile,
            freeVideos: videos.filter((video) => video.visibility === 'free'),
            lockedVideos: videos.filter((video) => video.visibility === 'locked'),
        };
    },
};
