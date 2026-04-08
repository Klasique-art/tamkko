import { Href, router } from 'expo-router';
import React from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import VideoSnapFeed from '@/components/feed/VideoSnapFeed';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';

const sanitizeHandle = (handle: string) => handle.replace(/^@/, '').trim();

export default function HomeFeedTab() {
    const isFocused = useIsFocused();
    const videos = useVideoFeedStore((state) => state.videos);

    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor('#000000', true);
        }, [])
    );

    const openCreator = (creatorHandle: string) => {
        const username = sanitizeHandle(creatorHandle);
        router.push(`/video/creator/${encodeURIComponent(username)}` as Href);
    };

    return (
        <>
            {isFocused ? <StatusBar barStyle="light-content" backgroundColor="#000000" /> : null}
            <VideoSnapFeed videos={videos} onCreatorPress={openCreator} showFeedSwitcher showEndOfFeedCard />
        </>
    );
}
