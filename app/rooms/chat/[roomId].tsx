import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function RoomChatScreen() {
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    return (
        <ScreenScaffold
            title="Room Chat"
            subtitle={`Real-time Socket.IO chat and reactions for room ${roomId ?? 'unknown'}.`}
        />
    );
}

