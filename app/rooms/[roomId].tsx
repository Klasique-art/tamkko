import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function RoomDetailScreen() {
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    return (
        <ScreenScaffold
            title="Room Detail"
            subtitle={`Membership details, entry fee, and join status for room: ${roomId ?? 'unknown'}.`}
            actions={[
                { label: 'Open Room Chat', href: `/rooms/chat/${roomId ?? 'sample-room'}` },
                { label: 'Manage Room', href: `/rooms/manage/${roomId ?? 'sample-room'}` },
            ]}
        />
    );
}

