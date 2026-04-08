import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { formatCurrency } from '@/lib/utils';
import { WalletWithdrawalItem } from '@/types/wallet.types';

const stepOrder = ['otp_required', 'pending', 'processing', 'completed'] as const;

export default function WalletWithdrawalStatusScreen() {
    const { withdrawalId } = useLocalSearchParams<{ withdrawalId: string }>();
    const colors = useColors();
    const safeId = withdrawalId ?? '';
    const [withdrawal, setWithdrawal] = React.useState<WalletWithdrawalItem | null>(null);

    const load = React.useCallback(async () => {
        if (!safeId) return;
        const next = await mockWalletService.getWithdrawalById(safeId);
        setWithdrawal(next);
    }, [safeId]);

    const poll = React.useCallback(async () => {
        if (!safeId) return;
        const next = await mockWalletService.pollWithdrawalStatus(safeId);
        setWithdrawal(next);
    }, [safeId]);

    React.useEffect(() => {
        void load();
    }, [load]);

    React.useEffect(() => {
        if (!withdrawal) return;
        if (withdrawal.status === 'completed' || withdrawal.status === 'failed' || withdrawal.status === 'rejected') return;
        if (withdrawal.status === 'otp_required') return;

        const timer = setInterval(() => {
            void poll();
        }, 2000);
        return () => clearInterval(timer);
    }, [poll, withdrawal]);

    if (!withdrawal) {
        return (
            <Screen title="Withdrawal Status">
                <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm" color={colors.textSecondary}>Loading withdrawal details...</AppText>
                </View>
            </Screen>
        );
    }

    const statusForProgress = withdrawal.status === 'failed' || withdrawal.status === 'rejected' ? 'processing' : withdrawal.status;
    const activeIndex = Math.max(0, stepOrder.indexOf(statusForProgress as any));

    return (
        <Screen title="Withdrawal Status" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Withdrawal {withdrawal.id}</AppText>
                    <AppText className="mt-1 text-base font-bold" color={colors.textPrimary}>{formatCurrency(withdrawal.amount, withdrawal.currency)}</AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{withdrawal.network.toUpperCase()} {withdrawal.phoneNumber}</AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{new Date(withdrawal.createdAt).toLocaleString()}</AppText>
                    <AppText className="mt-2 text-xs font-semibold" color={withdrawal.status === 'completed' ? colors.success : withdrawal.status === 'failed' || withdrawal.status === 'rejected' ? colors.error : colors.warning}>
                        {withdrawal.status.toUpperCase()}
                    </AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Payout Lifecycle</AppText>
                    <View className="mt-3">
                        {stepOrder.map((step, index) => {
                            const done = index <= activeIndex;
                            return (
                                <View key={step} className="mb-3 flex-row items-center">
                                    <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: done ? colors.accent : colors.border }}>
                                        <AppText className="text-[10px] font-bold" color={colors.background}>{index + 1}</AppText>
                                    </View>
                                    <View className="ml-3">
                                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>{step.toUpperCase()}</AppText>
                                        <AppText className="text-xs" color={colors.textSecondary}>
                                            {step === 'otp_required' ? 'OTP security check required.' : step === 'pending' ? 'Request accepted.' : step === 'processing' ? 'Payout processor is working.' : 'Money sent to MoMo account.'}
                                        </AppText>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    {withdrawal.failureReason ? (
                        <View className="rounded-xl border p-3" style={{ borderColor: `${colors.error}66`, backgroundColor: `${colors.error}12` }}>
                            <AppText className="text-xs" color={colors.error}>{withdrawal.failureReason}</AppText>
                        </View>
                    ) : null}

                    <View className="mt-3 flex-row">
                        <Pressable
                            onPress={() => void poll()}
                            className="mr-2 flex-1 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Check withdrawal status now"
                        >
                            <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Check Now</AppText>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/wallet/withdrawals')}
                            className="flex-1 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Back to withdrawals"
                        >
                            <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Back to List</AppText>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </Screen>
    );
}
