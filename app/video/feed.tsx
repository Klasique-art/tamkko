import { Href, router } from 'expo-router';
import React from 'react';

import VideoSnapFeed from '@/components/feed/VideoSnapFeed';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';

const sanitizeHandle = (handle: string) => handle.replace(/^@/, '').trim();

export default function VideoFeedScreen() {
    const videos = useVideoFeedStore((state) => state.videos);

    const openCreator = (creatorHandle: string) => {
        const username = sanitizeHandle(creatorHandle);
        router.push(`/video/creator/${encodeURIComponent(username)}` as Href);
    };

    return (
        <VideoSnapFeed
            videos={videos}
            onCreatorPress={openCreator}
            showTopNav
            showFeedSwitcher
            navTitle="Video Feed"
        />
    );
}
