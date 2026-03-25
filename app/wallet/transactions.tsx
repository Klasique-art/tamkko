import React from 'react';
import { ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockWalletTransactions } from '@/data/mock';

export default function WalletTransactionsScreen() {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Transactions</AppText>
                <View className="mt-4 gap-2">
                    {mockWalletTransactions.map((tx) => (
                        <View key={tx.id} className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="font-semibold" color={colors.textPrimary}>{tx.id}</AppText>
                            <AppText className="text-xs" color={colors.textSecondary}>{tx.type} - {tx.status}</AppText>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
