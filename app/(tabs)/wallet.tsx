import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function WalletTab() {
    return (
        <ScreenScaffold
            title="Wallet"
            subtitle="Balance, transactions, subscriptions, tips, and withdrawals."
            actions={[
                { label: 'Wallet Dashboard', href: '/wallet' },
                { label: 'Transactions', href: '/wallet/transactions' },
                { label: 'Withdrawals', href: '/wallet/withdrawals' },
            ]}
        />
    );
}
