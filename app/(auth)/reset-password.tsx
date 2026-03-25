import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function ResetPasswordScreen() {
    return (
        <ScreenScaffold
            title="Set New Password"
            subtitle="Set new account password after reset verification."
            actions={[{ label: 'Return To Login', href: '/(auth)/login' }]}
        />
    );
}
