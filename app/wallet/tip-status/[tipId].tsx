import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function TipStatusScreen() {
    const { tipId } = useLocalSearchParams<{ tipId: string }>();

    return <ScreenScaffold title="Tip Status" subtitle={`Payment polling and final status for tip ${tipId ?? 'unknown'}.`} />;
}

