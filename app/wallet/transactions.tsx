import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { formatCurrency } from '@/lib/utils';
import { SentTipItem, WalletTransaction } from '@/types/wallet.types';

type TransactionFilter = 'all' | 'credits' | 'debits';

export default function WalletTransactionsScreen() {
    const colors = useColors();
    const [transactions, setTransactions] = React.useState<WalletTransaction[]>([]);
    const [sentTips, setSentTips] = React.useState<SentTipItem[]>([]);
    const [filter, setFilter] = React.useState<TransactionFilter>('all');

    const load = React.useCallback(async () => {
        const [tx, tips] = await Promise.all([
            mockWalletService.getTransactions(),
            mockWalletService.getSentTips(),
        ]);
        setTransactions(tx);
        setSentTips(tips);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const filteredTransactions = React.useMemo(() => {
        if (filter === 'all') return transactions;
        return transactions.filter((tx) =>
            filter === 'credits' ? tx.direction !== 'debit' : tx.direction === 'debit'
        );
    }, [filter, transactions]);

    return (
        <Screen className="pt-3" title="Transactions">
            <FlashList
                data={filteredTransactions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        <View className="rounded-xl border p-1" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View className="flex-row">
                                {([
                                    { id: 'all', label: 'All' },
                                    { id: 'credits', label: 'Credits' },
                                    { id: 'debits', label: 'Debits' },
                                ] as const).map((item) => {
                                    const selected = filter === item.id;
                                    return (
                                        <Pressable
                                            key={item.id}
                                            onPress={() => setFilter(item.id)}
                                            className="flex-1 rounded-lg py-2"
                                            style={{ backgroundColor: selected ? colors.background : 'transparent' }}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected }}
                                            accessibilityLabel={`Show ${item.label}`}
                                        >
                                            <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>{item.label}</AppText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mt-4 mb-2 flex-row items-center justify-between">
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>Wallet Transactions</AppText>
                            <Pressable onPress={() => void load()} accessibilityRole="button" accessibilityLabel="Refresh transactions">
                                <AppText className="text-xs font-semibold" color={colors.accent}>Refresh</AppText>
                            </Pressable>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="mb-2 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-2">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>{item.title ?? item.type.toUpperCase()}</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.subtitle ?? item.type}</AppText>
                            </View>
                            <AppText className="text-sm font-bold" color={item.direction === 'debit' ? colors.error : colors.success}>
                                {item.direction === 'debit' ? '-' : '+'}{formatCurrency(item.amount, item.currency)}
                            </AppText>
                        </View>
                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{item.status.toUpperCase()} - {new Date(item.createdAt).toLocaleString()}</AppText>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>No transactions found.</AppText>
                    </View>
                }
                ListFooterComponent={
                    <View className="mt-4">
                        <AppText className="mb-2 text-sm font-semibold" color={colors.textPrimary}>Sent Tips History</AppText>
                        {sentTips.length === 0 ? (
                            <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                                <AppText className="text-sm" color={colors.textSecondary}>No sent tips yet.</AppText>
                            </View>
                        ) : sentTips.map((tip) => (
                            <Pressable
                                key={tip.tipId}
                                onPress={() => router.push(`/wallet/tip-status/${encodeURIComponent(tip.tipId)}`)}
                                className="mb-2 rounded-xl border p-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                accessibilityRole="button"
                                accessibilityLabel={`Open tip ${tip.tipId} status`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>{tip.creatorUsername}</AppText>
                                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>{tip.reference}</AppText>
                                    </View>
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>{formatCurrency(tip.amount, tip.currency)}</AppText>
                                </View>
                                <AppText className="mt-1 text-[11px]" color={tip.status === 'failed' ? colors.error : tip.status === 'completed' ? colors.success : colors.warning}>
                                    {tip.status.toUpperCase()} - Tap to open status
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                }
            />
        </Screen>
    );
}
