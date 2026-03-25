import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function SearchScreen() {
    return (
        <ScreenScaffold
            title="Search"
            subtitle="Unified discovery search for users, videos, and hashtags."
            actions={[
                { label: 'Search Users', href: '/search/users' },
                { label: 'Search Videos', href: '/search/videos' },
                { label: 'Trending Hashtags', href: '/search/trending' },
            ]}
        />
    );
}
