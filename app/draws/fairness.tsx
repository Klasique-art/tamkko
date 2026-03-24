import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { fairnessService } from '@/lib/services/fairnessService';
import { DrawVerificationData } from '@/types/fairness.types';

const toPeriod = (month: string | null | undefined) => {
    if (!month) return 'Unknown period';
    const [year, monthNum] = month.split('-');
    const date = new Date(Number(year), Number(monthNum) - 1, 1);
    if (Number.isNaN(date.getTime())) return month;
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const shortenValue = (value: string | null | undefined) => {
    if (!value) return 'Not provided';
    return value.length > 48 ? `${value.slice(0, 24)}...${value.slice(-24)}` : value;
};

const FairnessScreen = () => {
    const colors = useColors();
    const router = useRouter();
    const { drawId, drawCode } = useLocalSearchParams<{ drawId?: string; drawCode?: string }>();

    const [verification, setVerification] = React.useState<DrawVerificationData | null>(null);
    const [isLoading, setIsLoading] = React.useState(Boolean(drawId));
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadVerification = async () => {
            if (!drawId) {
                setIsLoading(false);
                setError('Open this page from a draw details screen to verify fairness.');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fairnessService.getDrawVerification(String(drawId));
                if (!isMounted) return;
                setVerification(response);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Could not load fairness verification.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadVerification();

        return () => {
            isMounted = false;
        };
    }, [drawId]);

    return (
        <Screen>
            <Nav title="Verify Fairness" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {isLoading ? (
                    <View className="mt-6 items-center">
                        <ActivityIndicator color={colors.accent} />
                        <AppText className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
                            Loading draw verification...
                        </AppText>
                    </View>
                ) : null}

                {error ? (
                    <View
                        className="mb-3 rounded-2xl border p-3"
                        style={{ borderColor: `${colors.error}40`, backgroundColor: `${colors.error}10` }}
                    >
                        <AppText className="text-sm" style={{ color: colors.error }}>
                            {error}
                        </AppText>
                    </View>
                ) : null}

                {verification ? (
                    <>
                        <View
                            className="mb-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <View className="flex-row items-center justify-between">
                                <AppText className="text-base font-bold" style={{ color: colors.textPrimary }}>
                                    {verification.draw_id}
                                </AppText>
                                <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${colors.success}20` }}>
                                    <AppText className="text-xs font-semibold uppercase" style={{ color: colors.success }}>
                                        {verification.status}
                                    </AppText>
                                </View>
                            </View>
                            <AppText className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                                Period: {toPeriod(verification.month)}
                            </AppText>
                            <AppText className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                                Participants: {(verification.participants_count ?? 0).toLocaleString()}
                            </AppText>
                            <AppText className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                                Winners: {verification.number_of_winners ?? 0}
                            </AppText>
                        </View>

                        <View
                            className="mb-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                Draw Configuration
                            </AppText>
                            <AppText className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                                Total Pool: {verification.total_pool ?? 'N/A'}
                            </AppText>
                            <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                Prize Per Winner: {verification.prize_per_winner ?? 'N/A'}
                            </AppText>
                            <AppText className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                                Algorithm: {verification.algorithm ?? 'N/A'}
                            </AppText>
                        </View>

                        <View
                            className="rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        >
                            <AppText className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                Verification Values
                            </AppText>
                            <AppText className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                                Random Seed
                            </AppText>
                            <AppText className="mt-1 text-xs" style={{ color: colors.textPrimary }}>
                                {shortenValue(verification.random_seed)}
                            </AppText>
                            <AppText className="mt-3 text-xs" style={{ color: colors.textSecondary }}>
                                Verification Hash
                            </AppText>
                            <AppText className="mt-1 text-xs" style={{ color: colors.textPrimary }}>
                                {shortenValue(verification.verification_hash)}
                            </AppText>
                        </View>
                    </>
                ) : null}

                {!drawId ? (
                    <Pressable
                        onPress={() => router.push('/draws/history')}
                        className="mt-4 flex-row items-center justify-center rounded-xl px-4 py-3"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                        <AppText color="#FFFFFF" className="ml-2 font-semibold">
                            Go To All Distributions
                        </AppText>
                    </Pressable>
                ) : null}

                {drawCode ? (
                    <AppText className="mt-4 text-center text-xs" style={{ color: colors.textSecondary }}>
                        Requested from draw: {drawCode}
                    </AppText>
                ) : null}
            </ScrollView>
        </Screen>
    );
};

export default FairnessScreen;
