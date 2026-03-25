import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function RoomsHomeScreen() {
    return (
        <ScreenScaffold
            title="VIP Rooms"
            subtitle="Browse creator rooms, pricing, and access status."
            actions={[
                { label: 'Create Room', href: '/rooms/create' },
                { label: 'Joined Rooms', href: '/rooms/joined' },
                { label: 'Open Sample Room', href: '/rooms/sample-room' },
            ]}
        />
    );
}
