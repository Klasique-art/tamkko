import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { distributionService } from '@/lib/services/distributionService';
import { MySelectionItem, MySelectionStatusResponse } from '@/types/distribution.types';

const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

const statusColorMap: Record<MySelectionItem['payout_status'], string> = {
    pending: '#F8B735',
    processing: '#F38218',
    completed: '#1A760D',
    failed: '#DC2626',
};

const MySelectionStatusScreen = () => {
    const colors = useColors();
    const { user } = useAuth();
    const [status, setStatus] = React.useState<MySelectionStatusResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadStatus = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await distributionService.getMySelectionStatus();
                if (isMounted) {
                    setStatus({
                        ...response,
                        user_identifier: user?.user_id ?? 'current_user',
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Could not load your selection status.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadStatus();

        return () => {
            isMounted = false;
        };
    }, [user?.user_id]);

    const hasSelections = (status?.total_selection_count ?? 0) > 0;

    return (
        <Screen>
            <Nav title="My Selection Status" />

            {isLoading ? (
                <View className="mt-8 items-center justify-center">
                    <ActivityIndicator color={colors.accent} />
                    <AppText className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
                        Loading your selection status...
                    </AppText>
                </View>
            ) : (
                <View className="flex-1">
                    {error && (
                        <View
                            className="mb-3 rounded-2xl border p-3"
                            style={{ borderColor: `${colors.error}40`, backgroundColor: `${colors.error}10` }}
                        >
                            <AppText className="text-sm" style={{ color: colors.error }}>
                                {error}
                            </AppText>
                        </View>
                    )}

                    <View
                        className="mb-4 rounded-3xl border p-5"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    >
                        <AppText className="text-xs uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                            Your Selection Summary
                        </AppText>
                        <View className="mt-3 flex-row items-end justify-between">
                            <View>
                                <AppText className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                                    {status?.total_selection_count ?? 0}
                                </AppText>
                                <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                                    Times Selected
                                </AppText>
                            </View>
                            <View className="items-end">
                                <AppText className="text-2xl font-bold" style={{ color: colors.accent }}>
                                    {formatCurrency(status?.total_won_amount ?? 0, status?.currency ?? 'USD')}
                                </AppText>
                                <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                                    Total Won
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {!hasSelections ? (
                        <View
                            className="rounded-3xl border p-6"
                            style={{ borderColor: `${colors.accent}35`, backgroundColor: `${colors.accent}12` }}
                        >
                            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.accent}20` }}>
                                <Ionicons name="sparkles-outline" size={30} color={colors.accent} />
                            </View>
                            <AppText className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                                Your first win is still ahead
                            </AppText>
                            <AppText className="mt-2 text-sm leading-6" style={{ color: colors.textSecondary }}>
                                You have not been selected in previous distributions yet. Stay active with your monthly contributions and keep your streak strong.
                            </AppText>
                            <Pressable
                                onPress={() => router.push('/draws/history')}
                                className="mt-5 flex-row items-center justify-center rounded-xl px-4 py-3"
                                style={{ backgroundColor: colors.accent }}
                            >
                                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                                <AppText color="#FFFFFF" className="ml-2 font-semibold">
                                    View Distribution History
                                </AppText>
                            </Pressable>
                        </View>
                    ) : (
                        <FlashList
                            data={status?.selections ?? []}
                            estimatedItemSize={120}
                            keyExtractor={(item) => `${item.cycle_id}-${item.winner_id}`}
                            renderItem={({ item }) => (
                                <View
                                    className="mb-3 rounded-2xl border p-4"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <AppText className="text-base font-bold" style={{ color: colors.textPrimary }}>
                                            {item.period}
                                        </AppText>
                                        <View
                                            className="rounded-full px-3 py-1"
                                            style={{ backgroundColor: `${statusColorMap[item.payout_status]}20` }}
                                        >
                                            <AppText className="text-xs font-semibold uppercase" style={{ color: statusColorMap[item.payout_status] }}>
                                                {item.payout_status}
                                            </AppText>
                                        </View>
                                    </View>
                                    <AppText className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                                        Selected: {new Date(item.selected_at).toLocaleDateString('en-US')}
                                    </AppText>
                                    <AppText className="mt-2 text-lg font-bold" style={{ color: colors.accent }}>
                                        {formatCurrency(item.prize_amount, status?.currency ?? 'USD')}
                                    </AppText>
                                </View>
                            )}
                            contentContainerStyle={{ paddingBottom: 24 }}
                            ListHeaderComponent={
                                <AppText className="mb-3 text-sm font-semibold" style={{ color: colors.textSecondary }}>
                                    Your winning distributions
                                </AppText>
                            }
                        />
                    )}
                </View>
            )}
        </Screen>
    );
};

export default MySelectionStatusScreen;
