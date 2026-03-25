import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function TrendingHashtagsScreen() {
    return (
        <ScreenScaffold
            title="Trending Hashtags"
            subtitle="Top hashtags by current engagement and growth."
            actions={[{ label: 'Open #sample', href: '/search/hashtag/sample' }]}
        />
    );
}
