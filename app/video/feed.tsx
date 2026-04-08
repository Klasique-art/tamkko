import { Href, router } from 'expo-router';
import React from 'react';

import VideoSnapFeed from '@/components/feed/VideoSnapFeed';
import { mockVideos } from '@/data/mock';

const sanitizeHandle = (handle: string) => handle.replace(/^@/, '').trim();

export default function VideoFeedScreen() {
    const openCreator = (creatorHandle: string) => {
        const username = sanitizeHandle(creatorHandle);
        router.push(`/video/creator/${encodeURIComponent(username)}` as Href);
    };

    return (
        <VideoSnapFeed
            videos={mockVideos}
            onCreatorPress={openCreator}
            showTopNav
            showFeedSwitcher
            navTitle="Video Feed"
        />
    );
}
