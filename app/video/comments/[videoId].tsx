import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import CommentsThread from '@/components/feed/comments/CommentsThread';
import Screen from '@/components/ui/Screen';
import { mockVideos } from '@/data/mock';

export default function VideoCommentsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const safeVideoId = videoId ?? 'vid_001';
    const matchedVideo = mockVideos.find((item) => item.id === safeVideoId);

    return (
        <Screen title="Comments">
            <CommentsThread
                videoId={safeVideoId}
                videoTitle={matchedVideo?.title}
            />
        </Screen>
    );
}
