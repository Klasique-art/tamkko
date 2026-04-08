import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockReferralService } from '@/lib/services/mockReferralService';
import { ReferralEarningsSummary, ReferralRewardTransaction } from '@/types/referral.types';

type WindowFilter = 'all' | 'week' | 'month';

const formatCurrency = (value: number) => `GHS ${value.toFixed(2)}`;

export default function ReferralEarningsScreen() {
    const colors = useColors();
    const [summary, setSummary] = React.useState<ReferralEarningsSummary | null>(null);
    const [transactions, setTransactions] = React.useState<ReferralRewardTransaction[]>([]);
    const [filter, setFilter] = React.useState<WindowFilter>('all');

    React.useEffect(() => {
        const load = async () => {
            const [nextSummary, nextTransactions] = await Promise.all([
                mockReferralService.getEarningsSummary(),
                mockReferralService.getRewardTransactions(),
            ]);
            setSummary(nextSummary);
            setTransactions(nextTransactions);
        };
        void load();
    }, []);

    const filteredTransactions = React.useMemo(() => {
        if (filter === 'all') return transactions;
        const now = Date.now();
        const threshold = filter === 'week' ? now - 7 * 24 * 60 * 60 * 1000 : now - 30 * 24 * 60 * 60 * 1000;
        return transactions.filter((item) => new Date(item.createdAt).getTime() >= threshold);
    }, [filter, transactions]);

    return (
        <Screen title="Referral Earnings" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Earnings Overview</AppText>
                    <View className="mt-3 flex-row">
                        <View className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>This Week</AppText>
                            <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>
                                {formatCurrency(summary?.thisWeek ?? 0)}
                            </AppText>
                        </View>
                        <View className="ml-2 flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>This Month</AppText>
                            <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>
                                {formatCurrency(summary?.thisMonth ?? 0)}
                            </AppText>
                        </View>
                    </View>
                    <View className="mt-2 flex-row">
                        <View className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>All Time</AppText>
                            <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>
                                {formatCurrency(summary?.allTime ?? 0)}
                            </AppText>
                        </View>
                        <View className="ml-2 flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Pending</AppText>
                            <AppText className="mt-1 text-lg font-bold" color={colors.warning}>
                                {formatCurrency(summary?.pendingPayout ?? 0)}
                            </AppText>
                        </View>
                    </View>
                </View>

                <View className="mt-4 flex-row rounded-xl border p-1" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    {([
                        { id: 'all', label: 'All' },
                        { id: 'week', label: '7D' },
                        { id: 'month', label: '30D' },
                    ] as const).map((option) => {
                        const selected = filter === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                onPress={() => setFilter(option.id)}
                                className="flex-1 rounded-lg py-2"
                                style={{ backgroundColor: selected ? colors.background : 'transparent' }}
                                accessibilityRole="button"
                                accessibilityState={{ selected }}
                                accessibilityLabel={`Filter ${option.label}`}
                            >
                                <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>{option.label}</AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="mt-3 gap-2">
                    {filteredTransactions.length === 0 ? (
                        <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>No referral rewards in this period.</AppText>
                        </View>
                    ) : filteredTransactions.map((item) => (
                        <View key={item.id} className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>{item.referredUsername}</AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                        Tip {formatCurrency(item.tipAmountGhs)}
                                    </AppText>
                                </View>
                                <View className="items-end">
                                    <AppText className="text-xs" color={colors.textSecondary}>Your reward</AppText>
                                    <AppText className="text-base font-bold" color={colors.success}>{formatCurrency(item.rewardAmountGhs)}</AppText>
                                    <AppText className="mt-1 text-[11px]" color={item.status === 'credited' ? colors.success : colors.warning}>
                                        {item.status.toUpperCase()}
                                    </AppText>
                                </View>
                            </View>
                            <AppText className="mt-2 text-[11px]" color={colors.textSecondary}>
                                {new Date(item.createdAt).toLocaleString()}
                            </AppText>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
