import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockWalletService } from '@/lib/services/mockWalletService';
import { formatCurrency } from '@/lib/utils';
import { SentTipItem } from '@/types/wallet.types';

export default function WalletSentTipsScreen() {
    const colors = useColors();
    const [sentTips, setSentTips] = React.useState<SentTipItem[]>([]);

    const load = React.useCallback(async () => {
        const tips = await mockWalletService.getSentTips();
        setSentTips(tips);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    return (
        <Screen className="pt-3" title="Sent Tips History">
            <FlashList
                data={sentTips}
                keyExtractor={(item) => item.tipId}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View className="mb-2 flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Sent Tips</AppText>
                        <Pressable onPress={() => void load()} accessibilityRole="button" accessibilityLabel="Refresh sent tips">
                            <AppText className="text-xs font-semibold" color={colors.accent}>Refresh</AppText>
                        </Pressable>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => router.push(`/wallet/tip-status/${encodeURIComponent(item.tipId)}`)}
                        className="mb-2 rounded-xl border p-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel={`Open tip ${item.tipId} status`}
                    >
                        <View className="flex-row items-center justify-between">
                            <View>
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>{item.creatorUsername}</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.reference}</AppText>
                            </View>
                            <AppText className="text-sm font-bold" color={colors.textPrimary}>{formatCurrency(item.amount, item.currency)}</AppText>
                        </View>
                        <AppText className="mt-1 text-[11px]" color={item.status === 'failed' ? colors.error : item.status === 'completed' ? colors.success : colors.warning}>
                            {item.status.toUpperCase()} - Tap to open status
                        </AppText>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>No sent tips yet.</AppText>
                    </View>
                }
            />
        </Screen>
    );
}
