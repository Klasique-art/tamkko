import { CreateDraft } from '@/types/create.types';
import { VideoItem } from '@/types/video.types';
import { getVideoFeedItems, useVideoFeedStore } from '@/lib/stores/videoFeedStore';

type UploadJobStage = 'preparing' | 'uploading' | 'processing' | 'done' | 'failed';

export type VideoUploadJob = {
    id: string;
    progress: number;
    stage: UploadJobStage;
    createdAt: string;
    updatedAt: string;
    postId?: string;
    error?: string;
};

type UploadJobStoreItem = VideoUploadJob & {
    draft: CreateDraft;
    creatorUsername: string;
    startedAtMs: number;
    finalized: boolean;
};

const uploadJobsStore: UploadJobStoreItem[] = [];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const UPLOAD_STEPS: { atMs: number; progress: number; stage: UploadJobStage }[] = [
    { atMs: 0, progress: 0.06, stage: 'preparing' },
    { atMs: 500, progress: 0.15, stage: 'preparing' },
    { atMs: 1200, progress: 0.32, stage: 'uploading' },
    { atMs: 2000, progress: 0.51, stage: 'uploading' },
    { atMs: 2900, progress: 0.73, stage: 'uploading' },
    { atMs: 3800, progress: 0.87, stage: 'processing' },
    { atMs: 4700, progress: 0.95, stage: 'processing' },
    { atMs: 5600, progress: 1, stage: 'done' },
];

const toPublicJob = (job: UploadJobStoreItem): VideoUploadJob => ({
    id: job.id,
    progress: job.progress,
    stage: job.stage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    postId: job.postId,
    error: job.error,
});

const runUploadProgress = (job: UploadJobStoreItem) => {
    if (job.stage === 'done' || job.stage === 'failed') return;

    const elapsed = Date.now() - job.startedAtMs;
    let next = UPLOAD_STEPS[0];
    for (const step of UPLOAD_STEPS) {
        if (elapsed >= step.atMs) next = step;
    }

    job.progress = clamp(next.progress, 0, 1);
    job.stage = next.stage;
    job.updatedAt = nowIso();

    if (job.stage === 'done' && !job.finalized) {
        const created = useVideoFeedStore.getState().addCreatedPost({
            draft: job.draft,
            creatorUsername: job.creatorUsername,
        });
        job.postId = created?.id;
        job.finalized = true;
    }
};

export const mockVideoManagementService = {
    async createUploadJob(input: { draft: CreateDraft; creatorUsername: string }): Promise<VideoUploadJob> {
        const id = makeId('upl');
        const createdAt = nowIso();
        const item: UploadJobStoreItem = {
            id,
            draft: { ...input.draft },
            creatorUsername: input.creatorUsername,
            progress: 0.06,
            stage: 'preparing',
            createdAt,
            updatedAt: createdAt,
            startedAtMs: Date.now(),
            finalized: false,
        };
        uploadJobsStore.unshift(item);
        return toPublicJob(item);
    },

    async getUploadJob(jobId: string): Promise<VideoUploadJob | null> {
        const job = uploadJobsStore.find((item) => item.id === jobId);
        if (!job) return null;
        runUploadProgress(job);
        return toPublicJob(job);
    },

    async listUploadJobs(): Promise<VideoUploadJob[]> {
        for (const job of uploadJobsStore) runUploadProgress(job);
        return uploadJobsStore.map(toPublicJob);
    },

    async listSavedVideos(): Promise<VideoItem[]> {
        const items = getVideoFeedItems()
            .filter((item) => Boolean(item.isBookmarked))
            .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0));
        return items.map((item) => ({ ...item }));
    },

    async toggleSaved(videoId: string): Promise<VideoItem | null> {
        const next = useVideoFeedStore.getState().toggleBookmark(videoId);
        return next ? { ...next } : null;
    },

    async getVideoById(videoId: string): Promise<VideoItem | null> {
        const item = useVideoFeedStore.getState().getVideoById(videoId);
        return item ? { ...item } : null;
    },

    async updateVideoMetadata(
        videoId: string,
        patch: Partial<Pick<VideoItem, 'title' | 'caption' | 'allowComments' | 'postVisibility'>>
    ): Promise<VideoItem | null> {
        const next = useVideoFeedStore.getState().updateVideo(videoId, patch);
        return next ? { ...next } : null;
    },

    async deleteVideo(videoId: string): Promise<boolean> {
        const deleted = useVideoFeedStore.getState().deleteVideo(videoId);
        return deleted;
    },
};
