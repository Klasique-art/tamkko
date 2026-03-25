import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function EditVideoScreen() {
    const { videoId } = useLocalSearchParams<{ videoId: string }>();

    return (
        <ScreenScaffold
            title="Edit Video"
            subtitle={`Edit title, caption, hashtags, and visibility for: ${videoId ?? 'unknown'}.`}
        />
    );
}

