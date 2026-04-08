import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import CommentsThread from '@/components/feed/comments/CommentsThread';
import Screen from '@/components/ui/Screen';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';

export default function VideoCommentsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();
    const safeVideoId = videoId ?? 'vid_001';
    const videos = useVideoFeedStore((state) => state.videos);
    const matchedVideo = videos.find((item) => item.id === safeVideoId);

    return (
        <Screen title="Comments">
            <CommentsThread
                videoId={safeVideoId}
                videoTitle={matchedVideo?.title}
                commentsDisabled={matchedVideo?.allowComments === false}
            />
        </Screen>
    );
}
