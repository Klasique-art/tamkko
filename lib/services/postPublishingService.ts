import client from '@/lib/client';
import * as tus from 'tus-js-client';

type ApiEnvelope<T> = {
    success?: boolean;
    status?: string;
    data?: T;
    message?: string;
};

type VideoUploadInitResponse = {
    post_id: string;
    upload_id: string;
    upload_url: string;
    status: string;
};

type VideoUploadStatusResponse = {
    post_id: string;
    upload_id: string;
    asset_id: string | null;
    playback_id: string | null;
    playback_url: string | null;
    thumbnail_url: string | null;
    duration: number;
    status: 'processing' | 'ready' | 'failed' | string;
    ready_to_stream: boolean;
    video_codec?: string | null;
    video_profile?: string | null;
    error_code?: string | null;
    error_message?: string | null;
};

type ImageUploadConfigResponse = {
    cloud_name: string;
    upload_preset: string;
    upload_url: string;
    folder: string;
    allowed_formats: string[];
    max_size_mb: number;
};

type PublishVideoPayload = {
    media_type: 'video';
    upload_id: string;
    caption?: string;
    visibility: 'public' | 'paid' | 'followers_only' | 'private';
    allow_comments: boolean;
    price_ghs?: number | null;
};

type PublishImagePayload = {
    media_type: 'image';
    caption?: string;
    visibility: 'public' | 'paid' | 'followers_only' | 'private';
    allow_comments: boolean;
    price_ghs?: number | null;
    image_url: string;
    image_public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
};

type PublishPostResponse = {
    post: {
        id: string;
        creator_id: string;
        media_type: 'video' | 'image';
        caption?: string;
        visibility: 'public' | 'paid' | 'followers_only' | 'private';
        allow_comments: boolean;
        price_ghs: number | null;
        created_at: string;
        media: Record<string, unknown>;
    };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class UploadStatusError extends Error {
    code?: string;
    statusPayload?: VideoUploadStatusResponse;
    constructor(message: string, options?: { code?: string; statusPayload?: VideoUploadStatusResponse }) {
        super(message);
        this.name = 'UploadStatusError';
        this.code = options?.code;
        this.statusPayload = options?.statusPayload;
    }
}

const unwrapData = <T>(payload: ApiEnvelope<T> | T): T => {
    if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
        const data = (payload as ApiEnvelope<T>).data;
        if (data != null) return data;
    }
    return payload as T;
};

const guessImageMimeType = (fileName?: string | null, uri?: string) => {
    const source = `${fileName ?? ''}${uri ?? ''}`.toLowerCase();
    if (source.endsWith('.png')) return 'image/png';
    if (source.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
};

export const postPublishingService = {
    async initVideoUpload(payload: { title: string; description?: string; tags?: string[]; category?: string }) {
        const response = await client.post<ApiEnvelope<VideoUploadInitResponse>>('/videos/upload-url', payload);
        return unwrapData(response.data);
    },

    async uploadVideoToMux(input: {
        uploadUrl: string;
        fileUri: string;
        fileName?: string | null;
        mimeType?: string | null;
        fileSize?: number | null;
        onProgress?: (progress: number) => void;
    }) {
        const fileName = input.fileName ?? `tamkko_${Date.now()}.mp4`;
        const mimeType = input.mimeType ?? 'video/mp4';

        const uploadWithTus = () =>
            new Promise<void>((resolve, reject) => {
                const upload = new tus.Upload(
                    {
                        uri: input.fileUri,
                        type: mimeType,
                        name: fileName,
                    } as any,
                    {
                        uploadUrl: input.uploadUrl,
                        uploadSize: Number.isFinite(Number(input.fileSize)) ? Number(input.fileSize) : undefined,
                        retryDelays: [0, 1000, 3000, 5000],
                        chunkSize: 5 * 1024 * 1024,
                        removeFingerprintOnSuccess: true,
                        metadata: {
                            filename: fileName,
                            filetype: mimeType,
                        },
                        onProgress: (uploadedBytes, totalBytes) => {
                            if (!totalBytes) return;
                            const progress = Math.max(0, Math.min(1, uploadedBytes / totalBytes));
                            input.onProgress?.(progress);
                        },
                        onError: (error) => reject(error),
                        onSuccess: () => resolve(),
                    }
                );
                upload.start();
            });

        try {
            await uploadWithTus();
        } catch {
            // Fallback for runtimes/environments where TUS may fail unexpectedly.
            const fileResponse = await fetch(input.fileUri);
            const fileBlob = await fileResponse.blob();
            const uploadResponse = await fetch(input.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': fileBlob.type || mimeType || 'application/octet-stream',
                },
                body: fileBlob,
            });
            if (!uploadResponse.ok) {
                throw new Error('Video upload failed.');
            }
            input.onProgress?.(1);
        }
    },

    async getVideoUploadStatus(postId: string) {
        const response = await client.get<ApiEnvelope<VideoUploadStatusResponse>>(`/videos/${postId}/upload-status`);
        return unwrapData(response.data);
    },

    async waitForVideoReady(postId: string, options?: { maxAttempts?: number; intervalMs?: number }) {
        const maxAttempts = options?.maxAttempts ?? 40;
        const intervalMs = options?.intervalMs ?? 3000;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            const status = await this.getVideoUploadStatus(postId);
            if (status.ready_to_stream || status.status === 'ready') return status;
            if (status.status === 'failed') {
                throw new UploadStatusError(
                    status.error_message || 'Video processing failed.',
                    { code: status.error_code ?? undefined, statusPayload: status }
                );
            }
            await sleep(intervalMs);
        }

        throw new UploadStatusError('Video is still processing. Please try again shortly.');
    },

    async getImageUploadConfig() {
        const response = await client.get<ApiEnvelope<ImageUploadConfigResponse>>('/media/image-upload-config');
        return unwrapData(response.data);
    },

    async uploadImageToCloudinary(input: {
        imageUri: string;
        uploadUrl: string;
        uploadPreset: string;
        folder?: string;
        fileName?: string | null;
    }) {
        const formData = new FormData();
        formData.append('file', {
            uri: input.imageUri,
            type: guessImageMimeType(input.fileName, input.imageUri),
            name: input.fileName ?? `tamkko_${Date.now()}.jpg`,
        } as any);
        formData.append('upload_preset', input.uploadPreset);
        if (input.folder) formData.append('folder', input.folder);

        const response = await fetch(input.uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Image upload failed.');
        }

        return response.json() as Promise<{
            public_id: string;
            secure_url: string;
            width: number;
            height: number;
            format: string;
            bytes: number;
        }>;
    },

    async publishPost(payload: PublishVideoPayload | PublishImagePayload) {
        const response = await client.post<ApiEnvelope<PublishPostResponse>>('/videos/publish', payload);
        return unwrapData(response.data);
    },
};
