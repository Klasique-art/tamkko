import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function ReferralHomeScreen() {
    return (
        <ScreenScaffold
            title="Referral Hub"
            subtitle="Referral code, network, rewards, and ranking insights."
            actions={[
                { label: 'Referral Network', href: '/referral/network' },
                { label: 'Referral Earnings', href: '/referral/earnings' },
                { label: 'Leaderboard', href: '/referral/leaderboard' },
                { label: 'Ambassador', href: '/referral/ambassador' },
            ]}
        />
    );
}
