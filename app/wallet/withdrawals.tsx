import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function WalletWithdrawalsScreen() {
    return (
        <ScreenScaffold
            title="Withdrawals"
            subtitle="Initiate and track withdrawal requests."
            actions={[{ label: 'Sample Withdrawal', href: '/wallet/withdrawal/sample-withdrawal' }]}
        />
    );
}
