import { Ionicons } from '@expo/vector-icons';
import { Href, router, useFocusEffect } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { walletService } from '@/lib/services/walletService';
import { formatCurrency } from '@/lib/utils';
import { WalletSummary, WalletTransaction } from '@/types/wallet.types';

export default function WalletHomeScreen() {
    const colors = useColors();
    const [summary, setSummary] = React.useState<WalletSummary | null>(null);
    const [transactions, setTransactions] = React.useState<WalletTransaction[]>([]);
    const [loading, setLoading] = React.useState(true);
    const isRefreshingRef = React.useRef(false);

    const refresh = React.useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        setLoading(true);
        try {
            const [nextSummary, nextTransactions] = await Promise.all([
                walletService.getSummary(),
                walletService.getRecentActivities(4),
            ]);
            setSummary(nextSummary);
            setTransactions(nextTransactions);
        } finally {
            setLoading(false);
            isRefreshingRef.current = false;
        }
    }, []);

    useFocusEffect(React.useCallback(() => {
        void refresh();
        const interval = setInterval(() => {
            void refresh();
        }, 10000);

        return () => clearInterval(interval);
    }, [refresh]));

    return (
        <Screen className="pt-4" title="Wallet">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <AppText className="text-lg font-extrabold" color={colors.white}>Creator Wallet</AppText>
                    <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                        Track earnings, subscriptions, tips, and withdrawals in one place.
                    </AppText>

                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.14)' }}>
                        <AppText className="text-xs" color="rgba(255,255,255,0.9)">Available Balance</AppText>
                        <AppText className="mt-1 text-3xl font-black" color={colors.white}>
                            {summary ? formatCurrency(summary.availableBalance, summary.currency) : 'Loading...'}
                        </AppText>
                        <AppText className="mt-2 text-xs" color="rgba(255,255,255,0.9)">
                            Pending: {summary ? formatCurrency(summary.pendingBalance, summary.currency) : '--'}
                        </AppText>
                        <AppText className="mt-1 text-xs" color="rgba(255,255,255,0.9)">
                            Lifetime: {summary ? formatCurrency(summary.lifetimeEarnings, summary.currency) : '--'}
                        </AppText>
                    </View>
                </View>

                <View className="mt-4 gap-2">
                    {[
                        { label: 'Transactions', subtitle: 'Complete credits and debits history', href: '/wallet/transactions' as Href, icon: 'receipt-outline' as const },
                        { label: 'Earnings Breakdown', subtitle: 'Tips and subscription earnings per video', href: '/wallet/earnings' as Href, icon: 'stats-chart-outline' as const },
                        { label: 'Subscriptions', subtitle: 'Manage your active creator subscriptions', href: '/wallet/subscriptions' as Href, icon: 'repeat-outline' as const },
                        { label: 'Withdrawals', subtitle: 'Initiate withdrawals with OTP confirmation', href: '/wallet/withdrawals' as Href, icon: 'cash-outline' as const },
                        { label: 'Mobile Money Account', subtitle: 'Update payout number with OTP verification', href: '/wallet/momo-account' as Href, icon: 'phone-portrait-outline' as const },
                    ].map((item) => (
                        <Pressable
                            key={item.label}
                            onPress={() => router.push(item.href)}
                            className="rounded-2xl border px-4 py-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 pr-3">
                                    <AppText className="text-base font-bold" color={colors.textPrimary}>{item.label}</AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.subtitle}</AppText>
                                </View>
                                <Ionicons name={item.icon} size={18} color={colors.textPrimary} />
                            </View>
                        </Pressable>
                    ))}
                </View>

                <View className="mt-5 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Recent Activity</AppText>
                        <Pressable onPress={() => void refresh()} accessibilityRole="button" accessibilityLabel="Refresh wallet activity">
                            <AppText className="text-xs font-semibold" color={colors.accent}>Refresh</AppText>
                        </Pressable>
                    </View>

                    <View className="mt-3 gap-2">
                        {loading ? (
                            <AppText className="text-xs" color={colors.textSecondary}>Loading wallet activity...</AppText>
                        ) : transactions.length === 0 ? (
                            <AppText className="text-xs" color={colors.textSecondary}>No wallet activity yet.</AppText>
                        ) : transactions.map((tx) => (
                            <View key={tx.id} className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                <View className="flex-row items-center justify-between">
                                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>{tx.title ?? tx.type.toUpperCase()}</AppText>
                                    <AppText className="text-sm font-bold" color={tx.direction === 'debit' ? colors.error : colors.success}>
                                        {tx.direction === 'debit' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                                    </AppText>
                                </View>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>{tx.subtitle ?? tx.type}</AppText>
                                <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{tx.status.toUpperCase()} - {new Date(tx.createdAt).toLocaleString()}</AppText>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
