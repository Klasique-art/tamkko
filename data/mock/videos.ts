import { VideoItem } from '@/types/video.types';

export const MOCK_TEST_VIDEO_SOURCE = require('../../assets/videos/test_vid.mp4');
export const MOCK_TEST_VIDEO_SOURCE_2 = require('../../assets/videos/test_vid_2.mp4');
export const MOCK_TEST_VIDEO_SOURCE_3 = require('../../assets/videos/test_vid_3.mp4');
export const MOCK_TEST_VIDEO_SOURCE_4 = require('../../assets/videos/test_vid_4.mp4');

export const mockVideos: VideoItem[] = [
    {
        id: 'vid_001',
        title: 'Street Dance Night',
        caption: 'Accra energy tonight',
        creatorUsername: '@klasique',
        thumbnailUrl: 'local-test-video',
        videoSource: MOCK_TEST_VIDEO_SOURCE,
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
        thumbnailUrl: 'local-test-video',
        videoSource: MOCK_TEST_VIDEO_SOURCE_2,
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
        thumbnailUrl: 'local-test-video',
        videoSource: MOCK_TEST_VIDEO_SOURCE_3,
        likesCount: 5021,
        commentsCount: 140,
        isLiked: false,
        isBookmarked: false,
    },
    {
        id: 'vid_004',
        title: 'Night Rehearsal',
        caption: 'Stage energy check',
        creatorUsername: '@klasique',
        thumbnailUrl: 'local-test-video',
        videoSource: MOCK_TEST_VIDEO_SOURCE_4,
        likesCount: 4102,
        commentsCount: 97,
        isLiked: false,
        isBookmarked: false,
    },
    {
        id: 'vid_005',
        title: 'Hook Challenge',
        caption: 'Drop your duet version',
        creatorUsername: '@ama.creator',
        thumbnailUrl: 'local-test-video',
        videoSource: MOCK_TEST_VIDEO_SOURCE,
        likesCount: 7399,
        commentsCount: 205,
        isLiked: false,
        isBookmarked: true,
    },
    {
        id: 'vid_006',
        title: 'Final Mix Teaser',
        caption: 'Ready for release',
        creatorUsername: '@campus.star',
        thumbnailUrl: 'local-test-video',
        videoSource: MOCK_TEST_VIDEO_SOURCE_2,
        likesCount: 2891,
        commentsCount: 56,
        isLiked: false,
        isBookmarked: false,
    },
];

export const mockTrendingHashtags = ['#tamkko', '#afrobeats', '#campuslife', '#creatorgrind', '#ghmusic'];
