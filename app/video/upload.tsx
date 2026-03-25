import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function UploadScreen() {
    return (
        <ScreenScaffold
            title="Upload Video"
            subtitle="Request direct upload URL and send file to cloud storage provider."
            actions={[{ label: 'Check Upload Progress', href: '/video/upload-progress' }]}
        />
    );
}
