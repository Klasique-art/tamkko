import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function CreateTab() {
    return (
        <ScreenScaffold
            title="Create"
            subtitle="Upload new videos, manage processing, and edit metadata."
            actions={[
                { label: 'Start Upload', href: '/video/upload' },
                { label: 'Upload Progress', href: '/video/upload-progress' },
            ]}
        />
    );
}
