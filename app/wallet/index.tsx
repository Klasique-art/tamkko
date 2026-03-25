import React from 'react';
import { ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockWalletSummary, mockWalletTransactions } from '@/data/mock';
import { formatCurrency } from '@/lib/utils';

export default function WalletHomeScreen() {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Wallet</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>All values are mocked for now.</AppText>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-xs" color={colors.textSecondary}>Available Balance</AppText>
                    <AppText className="mt-1 text-2xl font-bold" color={colors.textPrimary}>
                        {formatCurrency(mockWalletSummary.availableBalance, mockWalletSummary.currency)}
                    </AppText>
                    <AppText className="mt-2 text-xs" color={colors.textSecondary}>
                        Pending: {formatCurrency(mockWalletSummary.pendingBalance, mockWalletSummary.currency)}
                    </AppText>
                </View>

                <View className="mt-4 gap-2">
                    {mockWalletTransactions.map((tx) => (
                        <View key={tx.id} className="rounded-xl border p-3" style={{ borderColor: colors.border }}>
                            <AppText className="font-semibold" color={colors.textPrimary}>{tx.type.replace('_', ' ').toUpperCase()}</AppText>
                            <AppText className="text-xs" color={colors.textSecondary}>
                                {formatCurrency(tx.amount, tx.currency)} - {tx.status}
                            </AppText>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
