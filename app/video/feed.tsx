import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function VideoFeedScreen() {
    return (
        <ScreenScaffold
            title="Video Feed"
            subtitle="For You, Following, and Trending feed orchestration lives here."
            actions={[
                { label: 'Video Detail (Sample)', href: '/video/sample-video' },
                { label: 'Saved Videos', href: '/video/saved' },
            ]}
        />
    );
}
