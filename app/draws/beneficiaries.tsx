import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { distributionService } from '@/lib/services/distributionService';
import { DistributionBeneficiary, DistributionHistoryItem } from '@/types/distribution.types';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

const payoutColorMap: Record<DistributionBeneficiary['payout_status'], string> = {
    pending: '#F8B735',
    processing: '#F38218',
    completed: '#1A760D',
    failed: '#DC2626',
};

const DrawBeneficiariesScreen = () => {
    const colors = useColors();
    const { cycleId } = useLocalSearchParams<{ cycleId: string }>();

    const [cycle, setCycle] = React.useState<DistributionHistoryItem | null>(null);
    const [drawInternalId, setDrawInternalId] = React.useState<string | null>(null);
    const [beneficiaries, setBeneficiaries] = React.useState<DistributionBeneficiary[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadDetails = async () => {
            if (!cycleId) {
                setError('Missing distribution cycle id.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await distributionService.getDistributionDetail(String(cycleId));
                if (!isMounted) return;
                setCycle(response.cycle);
                setDrawInternalId(response.draw_internal_id);
                setBeneficiaries(Array.isArray(response.beneficiaries) ? response.beneficiaries : []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Could not load beneficiaries.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadDetails();

        return () => {
            isMounted = false;
        };
    }, [cycleId]);

    return (
        <Screen>
            <Nav title="Draw Beneficiaries" />
            {isLoading ? (
                <View className="mt-8 items-center justify-center">
                    <ActivityIndicator color={colors.accent} />
                    <AppText className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
                        Loading beneficiaries...
                    </AppText>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
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

                    {cycle && (
                        <View
                            className="mb-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                                {cycle.period}
                            </AppText>
                            <AppText className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                                Date: {new Date(cycle.distribution_date).toLocaleDateString('en-US')}
                            </AppText>
                            <AppText className="mt-2 text-base font-semibold" style={{ color: colors.textPrimary }}>
                                Pool: {formatCurrency(cycle.total_pool)}
                            </AppText>
                            <AppButton
                                title="Check Fairness"
                                variant="outline"
                                icon="shield-checkmark"
                                fullWidth
                                style={{ marginTop: 12 }}
                                onClick={() =>
                                    drawInternalId
                                        ? router.push({
                                            pathname: '/draws/fairness',
                                            params: { drawId: drawInternalId, drawCode: cycle.cycle_id },
                                        })
                                        : undefined
                                }
                                disabled={!drawInternalId}
                            />
                        </View>
                    )}

                    {(Array.isArray(beneficiaries) ? beneficiaries : []).map((member) => (
                        <View
                            key={member.winner_id}
                            className="mb-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <View className="flex-row items-center justify-between">
                                <AppText className="text-base font-bold" style={{ color: colors.textPrimary }}>
                                    {member.user_identifier}
                                </AppText>
                                <View
                                    className="rounded-full px-3 py-1"
                                    style={{ backgroundColor: `${payoutColorMap[member.payout_status]}20` }}
                                >
                                    <AppText className="text-xs font-semibold uppercase" style={{ color: payoutColorMap[member.payout_status] }}>
                                        {member.payout_status}
                                    </AppText>
                                </View>
                            </View>

                            <View className="mt-2 flex-row items-center">
                                <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                                <AppText className="ml-2 text-sm" style={{ color: colors.textPrimary }}>
                                    {formatCurrency(member.prize_amount)}
                                </AppText>
                            </View>

                            <View className="mt-1 flex-row items-center">
                                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                <AppText className="ml-2 text-xs" style={{ color: colors.textSecondary }}>
                                    Selected: {member.selected_at ? new Date(member.selected_at).toLocaleString('en-US') : 'N/A'}
                                </AppText>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </Screen>
    );
};

export default DrawBeneficiariesScreen;

