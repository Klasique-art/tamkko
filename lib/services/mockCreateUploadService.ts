import { CreateDraft } from '@/types/create.types';

export type MockUploadStage = 'preparing' | 'uploading' | 'processing' | 'done';

export type MockUploadProgress = {
    progress: number;
    stage: MockUploadStage;
};

export const simulateCreateUpload = async (
    draft: CreateDraft,
    onProgress: (state: MockUploadProgress) => void
) => {
    void draft;

    const steps: MockUploadProgress[] = [
        { progress: 0.08, stage: 'preparing' },
        { progress: 0.18, stage: 'preparing' },
        { progress: 0.34, stage: 'uploading' },
        { progress: 0.56, stage: 'uploading' },
        { progress: 0.72, stage: 'uploading' },
        { progress: 0.84, stage: 'processing' },
        { progress: 0.93, stage: 'processing' },
        { progress: 1, stage: 'done' },
    ];

    for (const step of steps) {
        onProgress(step);
        await new Promise((resolve) => setTimeout(resolve, 420));
    }

    return {
        id: `post_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
};
