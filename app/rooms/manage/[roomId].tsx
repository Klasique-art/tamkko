import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function RoomManageScreen() {
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    return (
        <ScreenScaffold
            title="Manage Room"
            subtitle={`Creator controls: close room, mute, kick, pin messages for room ${roomId ?? 'unknown'}.`}
        />
    );
}

