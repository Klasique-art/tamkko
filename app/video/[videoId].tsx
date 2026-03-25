import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function VideoDetailScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();

    return (
        <ScreenScaffold
            title="Video Detail"
            subtitle={`Single video experience for id: ${videoId ?? 'unknown'}.`}
            actions={[
                { label: 'Open Comments', href: `/video/comments/${videoId ?? 'sample-video'}` },
                { label: 'Edit Video Metadata', href: `/video/edit/${videoId ?? 'sample-video'}` },
            ]}
        />
    );
}

