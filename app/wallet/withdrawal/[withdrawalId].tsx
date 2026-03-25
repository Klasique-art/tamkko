import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ScreenScaffold } from '@/components/scaffold';

export default function WalletWithdrawalStatusScreen() {
    const { withdrawalId } = useLocalSearchParams<{ withdrawalId: string }>();

    return (
        <ScreenScaffold
            title="Withdrawal Status"
            subtitle={`Detail and lifecycle for withdrawal ${withdrawalId ?? 'unknown'}.`}
        />
    );
}

