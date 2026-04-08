import { VideoComment } from '@/types/comment.types';

const mockHandles = [
    '@akua',
    '@kwesi.media',
    '@nelly.gh',
    '@kojo.live',
    '@ama.visuals',
    '@nana.wav',
    '@esi.editz',
    '@yawstudios',
];

const baseComments = [
    'This is clean content.',
    'I replayed this three times already.',
    'The transitions are super smooth.',
    'Love this vibe.',
    'Camera work is sharp.',
    'This deserves more reach.',
    'How long did this take to make?',
    'Fire track selection.',
    'Posting quality consistently.',
    'Big creator energy.',
];

const makeCommentId = (videoId: string, index: number) => `${videoId}_c_${index + 1}`;

const makeCreatedAt = (minutesAgo: number) => {
    const now = Date.now();
    return new Date(now - minutesAgo * 60 * 1000).toISOString();
};

export const generateCommentsForVideo = (videoId: string, total = 16): VideoComment[] => {
    const generated: VideoComment[] = [];

    for (let i = 0; i < total; i += 1) {
        const authorHandle = mockHandles[i % mockHandles.length];
        generated.push({
            id: makeCommentId(videoId, i),
            videoId,
            authorHandle,
            text: baseComments[i % baseComments.length],
            createdAt: makeCreatedAt((i + 1) * 7),
            likesCount: (i * 3) % 40,
        });
    }

    if (generated.length >= 4) {
        generated.splice(3, 0, {
            id: `${videoId}_reply_1`,
            videoId,
            authorHandle: '@tamkko.fan',
            text: '@akua totally agree with you.',
            createdAt: makeCreatedAt(11),
            likesCount: 2,
            parentCommentId: generated[0]?.id,
            replyToHandle: generated[0]?.authorHandle,
        });
    }

    return generated;
};

export const mockCommentsByVideo: Record<string, VideoComment[]> = {
    vid_001: generateCommentsForVideo('vid_001', 26),
    vid_002: generateCommentsForVideo('vid_002', 21),
    vid_003: generateCommentsForVideo('vid_003', 19),
    vid_004: generateCommentsForVideo('vid_004', 16),
    vid_005: generateCommentsForVideo('vid_005', 14),
    vid_006: generateCommentsForVideo('vid_006', 18),
    vid_creator_001: generateCommentsForVideo('vid_creator_001', 17),
    vid_creator_002: generateCommentsForVideo('vid_creator_002', 15),
    vid_creator_003: generateCommentsForVideo('vid_creator_003', 20),
    vid_creator_004: generateCommentsForVideo('vid_creator_004', 13),
    vid_creator_005: generateCommentsForVideo('vid_creator_005', 19),
    vid_creator_006: generateCommentsForVideo('vid_creator_006', 16),
    vid_creator_007: generateCommentsForVideo('vid_creator_007', 12),
    vid_creator_008: generateCommentsForVideo('vid_creator_008', 18),
    vid_creator_009: generateCommentsForVideo('vid_creator_009', 15),
    vid_creator_010: generateCommentsForVideo('vid_creator_010', 21),
    vid_creator_011: generateCommentsForVideo('vid_creator_011', 14),
    vid_creator_012: generateCommentsForVideo('vid_creator_012', 16),
};
