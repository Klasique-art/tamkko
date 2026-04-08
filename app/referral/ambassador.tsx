import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockReferralService } from '@/lib/services/mockReferralService';
import { AmbassadorInviteStats, AmbassadorStatus } from '@/types/referral.types';

export default function AmbassadorScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [status, setStatus] = React.useState<AmbassadorStatus | null>(null);
    const [stats, setStats] = React.useState<AmbassadorInviteStats | null>(null);
    const [university, setUniversity] = React.useState('University of Ghana');
    const [reason, setReason] = React.useState('I run creator workshops and can onboard new student creators each month.');
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            const nextStatus = await mockReferralService.getAmbassadorStatus();
            setStatus(nextStatus);
            if (nextStatus.isAmbassador) {
                const nextStats = await mockReferralService.getAmbassadorInviteStats();
                setStats(nextStats);
            }
        };
        void load();
    }, []);

    const handleApply = React.useCallback(async () => {
        if (!university.trim() || !reason.trim()) {
            showToast('Add university and application reason.', { variant: 'warning' });
            return;
        }

        setSubmitting(true);
        const next = await mockReferralService.applyForAmbassador({ university: university.trim(), reason: reason.trim() });
        setStatus(next);
        setSubmitting(false);
        showToast('Ambassador application submitted.', { variant: 'success' });
    }, [reason, showToast, university]);

    const progress = React.useMemo(() => {
        if (!stats) return 0;
        if (stats.totalInvites <= 0) return 0;
        return Math.min(1, stats.approvedCreators / stats.totalInvites);
    }, [stats]);

    return (
        <Screen title="Campus Ambassador" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <AppText className="text-lg font-extrabold" color={colors.white}>Campus Ambassador Program</AppText>
                    <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                        Ambassadors unlock higher referral rates and campus leaderboard visibility.
                    </AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Current Status</AppText>
                    <AppText className="mt-2 text-base font-bold" color={status?.status === 'approved' ? colors.success : colors.textPrimary}>
                        {status?.status ? status.status.replace('_', ' ').toUpperCase() : 'LOADING'}
                    </AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                        Reward Rate: {status?.rewardRatePercent ?? 5}%
                    </AppText>
                    {status?.reviewMessage ? (
                        <AppText className="mt-2 text-xs" color={colors.textSecondary}>{status.reviewMessage}</AppText>
                    ) : null}
                </View>

                {status?.isAmbassador ? (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Ambassador Stats</AppText>
                        <View className="mt-3 flex-row">
                            <View className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                                <AppText className="text-xs" color={colors.textSecondary}>Campus</AppText>
                                <AppText className="mt-1 text-sm font-bold" color={colors.textPrimary}>{stats?.campus ?? '-'}</AppText>
                            </View>
                            <View className="ml-2 flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                                <AppText className="text-xs" color={colors.textSecondary}>Invites</AppText>
                                <AppText className="mt-1 text-sm font-bold" color={colors.textPrimary}>{stats?.totalInvites ?? 0}</AppText>
                            </View>
                        </View>
                        <View className="mt-2 flex-row">
                            <View className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                                <AppText className="text-xs" color={colors.textSecondary}>Approved</AppText>
                                <AppText className="mt-1 text-sm font-bold" color={colors.textPrimary}>{stats?.approvedCreators ?? 0}</AppText>
                            </View>
                            <View className="ml-2 flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                                <AppText className="text-xs" color={colors.textSecondary}>This Month</AppText>
                                <AppText className="mt-1 text-sm font-bold" color={colors.textPrimary}>GHS {(stats?.thisMonthRewardGhs ?? 0).toFixed(2)}</AppText>
                            </View>
                        </View>

                        <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Invite Conversion</AppText>
                            <View className="mt-2 h-3 overflow-hidden rounded-full" style={{ backgroundColor: `${colors.border}` }}>
                                <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: colors.accent }} />
                            </View>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                {Math.round(progress * 100)}% of invited creators became approved creators.
                            </AppText>
                        </View>
                    </View>
                ) : (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Apply to Become an Ambassador</AppText>

                        <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={university}
                                onChangeText={setUniversity}
                                placeholder="University / Campus"
                                placeholderTextColor={colors.textSecondary}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                accessibilityLabel="University"
                            />
                        </View>

                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={reason}
                                onChangeText={setReason}
                                placeholder="Why should we approve you?"
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                style={{ color: colors.textPrimary, minHeight: 96, paddingVertical: 10, textAlignVertical: 'top' }}
                                accessibilityLabel="Application reason"
                            />
                        </View>

                        <AppButton
                            title={submitting ? 'Submitting...' : 'Submit Application'}
                            onClick={() => {
                                void handleApply();
                            }}
                            loading={submitting}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                )}

                {status?.status === 'pending' ? (
                    <Pressable
                        className="mt-3 rounded-xl border px-4 py-3"
                        style={{ borderColor: `${colors.info}66`, backgroundColor: `${colors.info}10` }}
                        accessibilityRole="text"
                    >
                        <AppText className="text-sm font-semibold" color={colors.info}>Application Pending Review</AppText>
                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                            You will receive a push notification once your application is approved or rejected.
                        </AppText>
                    </Pressable>
                ) : null}
            </ScrollView>
        </Screen>
    );
}
