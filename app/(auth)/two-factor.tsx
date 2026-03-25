import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function TwoFactorScreen() {
    return (
        <ScreenScaffold
            title="2FA Challenge"
            subtitle="Enter authenticator code or backup code to complete login."
            actions={[
                { label: 'Back To Login', href: '/(auth)/login' },
                { label: 'Use Backup Code (Placeholder)' },
            ]}
        />
    );
}
