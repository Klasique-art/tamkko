import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { formatCurrency } from '@/lib/utils';
import { SentTipItem } from '@/types/wallet.types';

const statusOrder = ['pending', 'processing', 'completed'] as const;

export default function TipStatusScreen() {
    const { tipId } = useLocalSearchParams<{ tipId: string }>();
    const colors = useColors();
    const { showToast } = useToast();
    const [tip, setTip] = React.useState<SentTipItem | null>(null);
    const [polling, setPolling] = React.useState(false);

    const safeTipId = tipId ?? 'tip_001';

    const refreshStatus = React.useCallback(async () => {
        const next = await mockWalletService.getTipStatus(safeTipId);
        setTip(next);
    }, [safeTipId]);

    React.useEffect(() => {
        void refreshStatus();
    }, [refreshStatus]);

    React.useEffect(() => {
        if (!tip || tip.status === 'completed' || tip.status === 'failed') {
            setPolling(false);
            return;
        }

        setPolling(true);
        const timer = setInterval(() => {
            void refreshStatus();
        }, 1800);
        return () => clearInterval(timer);
    }, [tip, refreshStatus]);

    const progressIndex = tip ? Math.max(0, statusOrder.indexOf((tip.status === 'failed' ? 'processing' : tip.status) as any)) : 0;

    if (!tip) {
        return (
            <Screen title="Tip Status">
                <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm" color={colors.textSecondary}>Loading tip status...</AppText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title="Tip Status" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Tip Reference</AppText>
                    <AppText className="mt-1 text-base font-bold" color={colors.textPrimary}>{tip.reference}</AppText>
                    <AppText className="mt-2 text-xs" color={colors.textSecondary}>{tip.creatorUsername} - {tip.videoId}</AppText>
                    <AppText className="mt-1 text-sm font-semibold" color={colors.textPrimary}>{formatCurrency(tip.amount, tip.currency)}</AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Payment Lifecycle</AppText>
                        <AppText className="text-xs font-semibold" color={tip.status === 'failed' ? colors.error : tip.status === 'completed' ? colors.success : colors.warning}>
                            {tip.status.toUpperCase()}
                        </AppText>
                    </View>

                    <View className="mt-3">
                        {statusOrder.map((step, index) => {
                            const active = index <= progressIndex;
                            return (
                                <View key={step} className="mb-3 flex-row items-center">
                                    <View
                                        className="h-7 w-7 items-center justify-center rounded-full"
                                        style={{ backgroundColor: active ? colors.accent : colors.border }}
                                    >
                                        <Ionicons name={active ? 'checkmark' : 'ellipse'} size={12} color={colors.background} />
                                    </View>
                                    <View className="ml-3">
                                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>{step.toUpperCase()}</AppText>
                                        <AppText className="text-xs" color={colors.textSecondary}>
                                            {step === 'pending' ? 'Tip request created.' : step === 'processing' ? 'Waiting for MoMo confirmation.' : 'Payment settled.'}
                                        </AppText>
                                    </View>
                                </View>
                            );
                        })}
                        {tip.status === 'failed' ? (
                            <View className="rounded-xl border p-3" style={{ borderColor: `${colors.error}66`, backgroundColor: `${colors.error}12` }}>
                                <AppText className="text-xs font-semibold" color={colors.error}>Payment failed.</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>The MoMo approval did not complete. You can retry from the creator tip sheet.</AppText>
                            </View>
                        ) : null}
                    </View>

                    <View className="mt-2 flex-row">
                        <Pressable
                            onPress={() => void refreshStatus()}
                            className="mr-2 flex-1 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Check payment status now"
                        >
                            <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Check Now</AppText>
                        </Pressable>
                        <Pressable
                            onPress={async () => {
                                const seeded = await mockWalletService.seedDemoTipPending();
                                showToast(`Created demo tip ${seeded.reference}.`, { variant: 'success', duration: 1800 });
                            }}
                            className="flex-1 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Create a new demo pending tip"
                        >
                            <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Seed Demo Pending Tip</AppText>
                        </Pressable>
                    </View>

                    {polling ? (
                        <AppText className="mt-2 text-[11px]" color={colors.textSecondary}>Auto-polling every 1.8s until final state.</AppText>
                    ) : null}
                </View>
            </ScrollView>
        </Screen>
    );
}
