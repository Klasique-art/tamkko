import client from '@/lib/client';
import { VideoItem, VideoPostVisibility } from '@/types/video.types';

type ApiEnvelope<T> = {
    status?: string;
    data?: T;
    error?: {
        code?: string;
        message?: string;
    };
};

type MineFilter = 'all' | 'free' | 'paid';

type BackendMineVideo = {
    id: string;
    title?: string;
    name?: string;
    caption?: string;
    description?: string;
    media_type?: string;
    visibility?: 'public' | 'paid' | 'followers_only' | 'private';
    post_visibility?: 'public' | 'paid' | 'followers_only' | 'private';
    allow_comments?: boolean;
    allowComments?: boolean;
    created_at?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    views_count?: number;
    likes_count?: number;
    comments_count?: number;
    creator_username?: string;
    playback_url?: string;
    playback_id?: string;
    media?: {
        hls_url?: string;
        thumbnail_url?: string;
        provider?: string;
    };
};

type ListMineResponse = {
    items: BackendMineVideo[];
    next_cursor: string | null;
    has_more: boolean;
};

const unwrapData = <T>(payload: ApiEnvelope<T> | T): T => {
    if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
        const data = (payload as ApiEnvelope<T>).data;
        if (data != null) return data;
    }
    return payload as T;
};

const mapVisibility = (value?: BackendMineVideo['visibility'] | BackendMineVideo['post_visibility']): VideoPostVisibility => {
    if (value === 'paid') return 'premium';
    if (value === 'followers_only') return 'followers_only';
    if (value === 'private') return 'private';
    return 'public';
};

const mapMineVideoToItem = (raw: BackendMineVideo): VideoItem => ({
    id: String(raw.id),
    title: String(raw.title ?? raw.name ?? 'Untitled post'),
    mediaType: raw.media_type === 'image' ? 'image' : 'video',
    caption: raw.caption ?? raw.description ?? '',
    thumbnailUrl: raw.thumbnail_url ?? raw.media?.thumbnail_url ?? (raw.media as any)?.url ?? undefined,
    playbackUrl: raw.playback_url ?? raw.media?.hls_url ?? undefined,
    videoSource: raw.playback_url || raw.media?.hls_url ? { uri: (raw.playback_url ?? raw.media?.hls_url)! } : undefined,
    creatorUsername: String(raw.creator_username ?? '@you'),
    viewsCount: Number(raw.views_count ?? 0),
    likesCount: Number(raw.likes_count ?? 0),
    commentsCount: Number(raw.comments_count ?? 0),
    allowComments: raw.allow_comments ?? raw.allowComments ?? true,
    postVisibility: mapVisibility(raw.visibility ?? raw.post_visibility),
    createdAt: raw.created_at ?? undefined,
});

export const myVideosService = {
    async listMine(params?: { cursor?: string | null; limit?: number; filter?: MineFilter }) {
        const response = await client.get<ApiEnvelope<ListMineResponse>>('/videos/mine', {
            params: {
                cursor: params?.cursor ?? undefined,
                limit: params?.limit ?? 20,
                filter: params?.filter ?? 'all',
            },
        });
        const data = unwrapData(response.data);
        return {
            items: (data.items ?? []).map(mapMineVideoToItem),
            nextCursor: data.next_cursor ?? null,
            hasMore: Boolean(data.has_more),
        };
    },

    async getMineVideo(videoId: string): Promise<VideoItem | null> {
        const response = await client.get<ApiEnvelope<{ post: BackendMineVideo } | BackendMineVideo>>(`/videos/mine/${videoId}`);
        const data = unwrapData(response.data);
        const raw = (data as any)?.post ?? data;
        if (!raw) return null;
        return mapMineVideoToItem(raw as BackendMineVideo);
    },

    async updateMineVideo(
        videoId: string,
        payload: { title: string; caption?: string; visibility: 'public' | 'paid' | 'followers_only' | 'private'; allow_comments: boolean }
    ): Promise<VideoItem | null> {
        const response = await client.patch<ApiEnvelope<{ post: BackendMineVideo } | BackendMineVideo>>(`/videos/mine/${videoId}`, payload);
        const data = unwrapData(response.data);
        const raw = (data as any)?.post ?? data;
        if (!raw) return null;
        return mapMineVideoToItem(raw as BackendMineVideo);
    },

    async deleteMineVideo(videoId: string): Promise<boolean> {
        await client.delete(`/videos/${videoId}`);
        return true;
    },
};
