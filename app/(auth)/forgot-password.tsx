import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function ForgotPasswordScreen() {
    return (
        <ScreenScaffold
            title="Forgot Password"
            subtitle="Request password reset OTP via phone or email."
            actions={[
                { label: 'Verify Reset OTP', href: '/(auth)/reset-verify' },
                { label: 'Back To Login', href: '/(auth)/login' },
            ]}
        />
    );
}
