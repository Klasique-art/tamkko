import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function VerifyPhoneScreen() {
    return (
        <ScreenScaffold
            title="Verify Phone"
            subtitle="Enter 6-digit SMS OTP to unlock wallet and monetization features."
            actions={[{ label: 'Resend SMS OTP (Placeholder)' }]}
        />
    );
}
