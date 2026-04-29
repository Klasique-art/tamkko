import React from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { walletService } from '@/lib/services/walletService';
import { formatCurrency } from '@/lib/utils';
import { EarningsByVideoItem, WalletEarningsBreakdownSummary } from '@/types/wallet.types';

const percent = (value: number, total: number) => {
    if (total <= 0) return 0;
    return Math.round((value / total) * 100);
};

export default function WalletEarningsScreen() {
    const colors = useColors();
    const [rows, setRows] = React.useState<EarningsByVideoItem[]>([]);
    const [summary, setSummary] = React.useState<WalletEarningsBreakdownSummary | null>(null);
    const isRefreshingRef = React.useRef(false);

    const load = React.useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        try {
            const next = await walletService.getEarningsBreakdown();
            setRows(next.videos);
            setSummary(next.summary);
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    useFocusEffect(React.useCallback(() => {
        void load();
        const interval = setInterval(() => {
            void load();
        }, 10000);
        return () => clearInterval(interval);
    }, [load]));

    const totals = summary ?? {
        currency: 'GHS',
        totalEarnings: 0,
        totalViews: 0,
        tipsTotal: 0,
        subscriptionsTotal: 0,
        referralRewardsTotal: 0,
    };

    const topVideo = React.useMemo(() => {
        if (rows.length === 0) return null;
        return [...rows].sort((a, b) => b.totalEarnings - a.totalEarnings)[0] ?? null;
    }, [rows]);

    const sorted = React.useMemo(() => [...rows].sort((a, b) => b.totalEarnings - a.totalEarnings), [rows]);
    const maxTotal = React.useMemo(() => Math.max(1, ...sorted.map((item) => item.totalEarnings)), [sorted]);

    return (
        <Screen title="Earnings Breakdown" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                            <AppText className="text-lg font-extrabold" color={colors.white}>Earnings Command Center</AppText>
                            <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                                Track which videos drive the most value and how revenue splits across tips and subscriptions.
                            </AppText>
                        </View>
                        <Pressable
                            onPress={() => void load()}
                            className="rounded-lg border px-3 py-2"
                            style={{ borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.16)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Refresh earnings data"
                        >
                            <AppText className="text-xs font-semibold" color={colors.white}>Refresh</AppText>
                        </Pressable>
                    </View>

                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.14)' }}>
                        <AppText className="text-xs" color="rgba(255,255,255,0.88)">Total Earnings</AppText>
                        <AppText className="mt-1 text-3xl font-black" color={colors.white}>{formatCurrency(totals.totalEarnings, totals.currency)}</AppText>
                        <AppText className="mt-1 text-xs" color="rgba(255,255,255,0.88)">{totals.totalViews.toLocaleString()} total views</AppText>
                    </View>
                </View>

                <View className="mt-4 flex-row">
                    <View className="flex-1 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-xs" color={colors.textSecondary}>Tips</AppText>
                        <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>{formatCurrency(totals.tipsTotal, totals.currency)}</AppText>
                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{percent(totals.tipsTotal, totals.totalEarnings)}% share</AppText>
                    </View>
                    <View className="ml-2 flex-1 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-xs" color={colors.textSecondary}>Subscriptions</AppText>
                        <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>{formatCurrency(totals.subscriptionsTotal, totals.currency)}</AppText>
                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{percent(totals.subscriptionsTotal, totals.totalEarnings)}% share</AppText>
                    </View>
                </View>
                <View className="mt-2 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-xs" color={colors.textSecondary}>Referral Rewards</AppText>
                    <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>{formatCurrency(totals.referralRewardsTotal, totals.currency)}</AppText>
                    <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>{percent(totals.referralRewardsTotal, totals.totalEarnings)}% share</AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Revenue Split</AppText>
                    <View
                        className="mt-3 h-4 flex-row overflow-hidden rounded-full"
                        style={{ backgroundColor: colors.border }}
                        accessibilityRole="progressbar"
                        accessibilityLabel="Revenue split chart"
                        accessibilityValue={{
                            min: 0,
                            max: totals.totalEarnings || 1,
                            now: totals.tipsTotal,
                            text: `${percent(totals.tipsTotal, totals.totalEarnings)} percent tips, ${percent(totals.subscriptionsTotal, totals.totalEarnings)} percent subscriptions, and ${percent(totals.referralRewardsTotal, totals.totalEarnings)} percent referral rewards`,
                        }}
                    >
                        <View style={{ width: `${percent(totals.tipsTotal, totals.totalEarnings)}%`, backgroundColor: colors.accent }} />
                        <View style={{ width: `${percent(totals.subscriptionsTotal, totals.totalEarnings)}%`, backgroundColor: colors.info }} />
                        <View style={{ width: `${percent(totals.referralRewardsTotal, totals.totalEarnings)}%`, backgroundColor: colors.warning }} />
                    </View>
                    <View className="mt-2 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                            <AppText className="ml-1 text-xs" color={colors.textSecondary}>Tips</AppText>
                        </View>
                        <View className="flex-row items-center">
                            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.info }} />
                            <AppText className="ml-1 text-xs" color={colors.textSecondary}>Subscriptions</AppText>
                        </View>
                        <View className="flex-row items-center">
                            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.warning }} />
                            <AppText className="ml-1 text-xs" color={colors.textSecondary}>Referral</AppText>
                        </View>
                    </View>
                </View>

                {topVideo ? (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Top Performer</AppText>
                        <AppText className="mt-2 text-base font-bold" color={colors.textPrimary}>{topVideo.title}</AppText>
                        <View className="mt-2 flex-row items-center justify-between">
                            <AppText className="text-xs" color={colors.textSecondary}>{topVideo.views.toLocaleString()} views</AppText>
                            <AppText className="text-sm font-bold" color={colors.success}>{formatCurrency(topVideo.totalEarnings, 'GHS')}</AppText>
                        </View>
                    </View>
                ) : null}

                <View className="mt-4">
                    <AppText className="mb-2 text-sm font-semibold" color={colors.textPrimary}>Video Earnings Ranking</AppText>
                    <View className="gap-2">
                        {sorted.length === 0 ? (
                            <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>No ranked videos yet</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Your video earnings ranking will appear here once tips or subscription earnings start coming in.
                                </AppText>
                            </View>
                        ) : sorted.map((row, index) => (
                            <View key={row.videoId} className="rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 pr-2">
                                        <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: colors.background }}>
                                            <AppText className="text-[11px] font-bold" color={colors.textPrimary}>#{index + 1}</AppText>
                                        </View>
                                        <AppText className="ml-2 flex-1 text-sm font-semibold" color={colors.textPrimary} numberOfLines={1}>{row.title}</AppText>
                                    </View>
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>{formatCurrency(row.totalEarnings, 'GHS')}</AppText>
                                </View>

                                <View className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
                                    <View style={{ width: `${Math.round((row.totalEarnings / maxTotal) * 100)}%`, backgroundColor: colors.accent, height: '100%' }} />
                                </View>

                                <View className="mt-2 flex-row items-center justify-between">
                                    <AppText className="text-[11px]" color={colors.textSecondary}>Tips {formatCurrency(row.tipsEarnings, 'GHS')}</AppText>
                                    <AppText className="text-[11px]" color={colors.textSecondary}>Subs {formatCurrency(row.subscriptionsEarnings, 'GHS')}</AppText>
                                    <AppText className="text-[11px]" color={colors.textSecondary}>{row.views.toLocaleString()} views</AppText>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
