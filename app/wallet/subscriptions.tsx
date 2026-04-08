import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { formatCurrency } from '@/lib/utils';
import { WalletSubscriptionItem } from '@/types/wallet.types';

export default function WalletSubscriptionsScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [subscriptions, setSubscriptions] = React.useState<WalletSubscriptionItem[]>([]);
    const [selectedToCancel, setSelectedToCancel] = React.useState<WalletSubscriptionItem | null>(null);

    const load = React.useCallback(async () => {
        const next = await mockWalletService.getSubscriptions();
        setSubscriptions(next);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    React.useEffect(() => {
        const pending = subscriptions.filter((item) => item.status === 'pending');
        if (pending.length === 0) return;

        const timer = setInterval(() => {
            pending.forEach((item) => {
                void mockWalletService.pollSubscriptionStatus(item.id);
            });
            void load();
        }, 2200);
        return () => clearInterval(timer);
    }, [load, subscriptions]);

    const activeCount = subscriptions.filter((item) => item.status === 'active').length;

    const handleCancelConfirm = React.useCallback(async () => {
        if (!selectedToCancel) return;
        await mockWalletService.cancelSubscription(selectedToCancel.id);
        setSelectedToCancel(null);
        await load();
        showToast('Subscription cancelled. Access remains until current period ends.', { variant: 'success', duration: 2200 });
    }, [load, selectedToCancel, showToast]);

    return (
        <Screen title="Subscriptions" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Active Subscriptions</AppText>
                    <AppText className="mt-1 text-2xl font-black" color={colors.textPrimary}>{activeCount}</AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                        Pending subscriptions are auto-polled and will activate when payment settles.
                    </AppText>
                </View>

                <View className="mt-3 gap-2">
                    {subscriptions.length === 0 ? (
                        <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>No subscriptions found.</AppText>
                        </View>
                    ) : subscriptions.map((sub) => (
                        <View key={sub.id} className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 pr-2">
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>{sub.creatorDisplayName}</AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>{sub.creatorUsername}</AppText>
                                </View>
                                <View className="items-end">
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>{formatCurrency(sub.amount, sub.currency)}/month</AppText>
                                    <AppText className="mt-1 text-[11px]" color={sub.status === 'active' ? colors.success : sub.status === 'pending' ? colors.warning : colors.error}>
                                        {sub.status.toUpperCase()}
                                    </AppText>
                                </View>
                            </View>

                            <AppText className="mt-2 text-xs" color={colors.textSecondary}>
                                Renews on {new Date(sub.renewsAt).toLocaleDateString()}
                                {sub.cancelAtPeriodEnd ? ' | Cancelled at period end' : ''}
                            </AppText>

                            {sub.status === 'active' && !sub.cancelAtPeriodEnd ? (
                                <Pressable
                                    onPress={() => setSelectedToCancel(sub)}
                                    className="mt-3 rounded-lg border py-2"
                                    style={{ borderColor: `${colors.error}66`, backgroundColor: `${colors.error}12` }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Cancel ${sub.creatorDisplayName} subscription`}
                                >
                                    <AppText className="text-center text-xs font-semibold" color={colors.error}>Cancel Subscription</AppText>
                                </Pressable>
                            ) : null}
                        </View>
                    ))}
                </View>

                <Pressable
                    onPress={() => void load()}
                    className="mt-3 rounded-xl border py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh subscriptions"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Refresh Subscription Status</AppText>
                </Pressable>
            </ScrollView>

            <ConfirmModal
                visible={Boolean(selectedToCancel)}
                onClose={() => setSelectedToCancel(null)}
                onConfirm={handleCancelConfirm}
                title="Cancel Subscription"
                description={`Cancel subscription to ${selectedToCancel?.creatorDisplayName ?? 'creator'}?`}
                confirmText="Yes, Cancel"
                isDestructive
            />
        </Screen>
    );
}
