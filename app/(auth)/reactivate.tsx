import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function ReactivateScreen() {
    return (
        <ScreenScaffold
            title="Reactivate Account"
            subtitle="Reactivate deactivated account within grace period via OTP confirmation."
            actions={[{ label: 'Back To Login', href: '/(auth)/login' }]}
        />
    );
}
