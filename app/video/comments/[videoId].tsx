import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function VideoCommentsScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();

    return (
        <ScreenScaffold
            title="Comments"
            subtitle={`Threaded comments and replies for video: ${videoId ?? 'unknown'}.`}
        />
    );
}

