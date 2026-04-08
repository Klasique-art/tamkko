import { CurrentUser } from '@/types/user.types';
import { VideoItem } from '@/types/video.types';

export type ProfileVideoCollectionTab = 'free' | 'paid' | 'bookmarked' | 'liked';

type ProfileVideoCollections = {
    free: VideoItem[];
    paid: VideoItem[];
    bookmarked: VideoItem[];
    liked: VideoItem[];
};

const toSafeHandle = (value: string) => `@${value.replace(/^@+/, '').trim().toLowerCase().replace(/\s+/g, '.')}`;

const createViewerHandleSet = (user: CurrentUser | null) => {
    const handles = new Set<string>();
    if (!user) return handles;

    const first = user.first_name?.trim().toLowerCase();
    const emailPrefix = user.email?.split('@')[0]?.trim().toLowerCase();
    if (first) handles.add(toSafeHandle(first));
    if (emailPrefix) handles.add(toSafeHandle(emailPrefix));
    return handles;
};

const byRecent = (a: VideoItem, b: VideoItem) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0);

const withSimulationVisibility = (videos: VideoItem[], simulatedHandle: string): VideoItem[] =>
    videos.map((video, index) => ({
        ...video,
        creatorUsername: simulatedHandle,
        postVisibility: index % 3 === 0 ? 'premium' : 'public',
    }));

export const buildProfileVideoCollections = (videos: VideoItem[], user: CurrentUser | null): ProfileVideoCollections => {
    const handleSet = createViewerHandleSet(user);
    const primaryHandle = handleSet.values().next().value ?? '@you';
    const isOwnedByViewer = (video: VideoItem) =>
        video.id.startsWith('vid_post_') || handleSet.has(toSafeHandle(video.creatorUsername));

    const ownedVideos = videos.filter(isOwnedByViewer);

    const managedBase = ownedVideos.length > 0
        ? [...ownedVideos].sort(byRecent)
        : withSimulationVisibility(
            videos.filter((video) => video.id.startsWith('vid_')).slice(0, 24),
            primaryHandle
        ).sort(byRecent);

    const free = managedBase.filter((video) => video.postVisibility !== 'premium');
    const paid = managedBase.filter((video) => video.postVisibility === 'premium');
    const bookmarked = videos
        .filter((video) => Boolean(video.isBookmarked) && !isOwnedByViewer(video))
        .sort(byRecent);
    const liked = videos.filter((video) => Boolean(video.isLiked)).sort(byRecent);

    return { free, paid, bookmarked, liked };
};
