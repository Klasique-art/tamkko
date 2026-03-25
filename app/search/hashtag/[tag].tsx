import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function HashtagScreen() {
    const { tag } = useLocalSearchParams<{ tag: string }>();

    return (
        <ScreenScaffold
            title={`#${tag ?? 'hashtag'}`}
            subtitle="Videos and creators associated with this hashtag."
        />
    );
}

