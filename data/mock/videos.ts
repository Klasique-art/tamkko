import { VideoItem } from '@/types/video.types';

export const mockVideos: VideoItem[] = [
    {
        id: 'vid_001',
        title: 'Street Dance Night',
        caption: 'Accra energy tonight',
        creatorUsername: '@klasique',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1080&q=80',
        likesCount: 12403,
        commentsCount: 321,
        isLiked: false,
        isBookmarked: false,
    },
    {
        id: 'vid_002',
        title: 'Studio Session Snippet',
        caption: 'New track loading',
        creatorUsername: '@ama.creator',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1080&q=80',
        likesCount: 8430,
        commentsCount: 210,
        isLiked: true,
        isBookmarked: true,
    },
    {
        id: 'vid_003',
        title: 'Campus Mic Challenge',
        caption: 'Who should win this round?',
        creatorUsername: '@campus.star',
        thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1080&q=80',
        likesCount: 5021,
        commentsCount: 140,
        isLiked: false,
        isBookmarked: false,
    },
];

export const mockTrendingHashtags = ['#tamkko', '#afrobeats', '#campuslife', '#creatorgrind', '#ghmusic'];
