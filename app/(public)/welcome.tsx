import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function WelcomeScreen() {
    return (
        <ScreenScaffold
            title="Welcome"
            subtitle="Choose where to start: onboarding, login, or registration."
            actions={[
                { label: 'Open Onboarding', href: '/onboarding' },
                { label: 'Login', href: '/(auth)/login' },
                { label: 'Register', href: '/(auth)/register' },
                { label: 'Privacy Policy', href: '/(public)/privacy' },
            ]}
        />
    );
}
