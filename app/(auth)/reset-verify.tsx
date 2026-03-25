import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function ResetVerifyScreen() {
    return (
        <ScreenScaffold
            title="Verify Reset OTP"
            subtitle="Confirm reset OTP before setting a new password."
            actions={[{ label: 'Set New Password', href: '/(auth)/reset-password' }]}
        />
    );
}
