import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockReferralService } from '@/lib/services/mockReferralService';
import { ReferralProfile } from '@/types/referral.types';

export default function ReferralHomeScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [profile, setProfile] = React.useState<ReferralProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            setLoading(true);
            const next = await mockReferralService.getProfile();
            setProfile(next);
            setLoading(false);
        };
        void load();
    }, []);

    const handleShareLink = React.useCallback(async () => {
        if (!profile) return;
        await Share.share({
            title: 'Join me on Tamkko',
            message: `Join Tamkko with my invite link: ${profile.referralLink}`,
        });
    }, [profile]);

    const handleCopyCode = React.useCallback(() => {
        if (!profile) return;
        showToast(`Referral code ${profile.referralCode} ready to share.`, { variant: 'success', duration: 1800 });
    }, [profile, showToast]);

    return (
        <Screen className="pt-4" title="Referral">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <AppText className="text-lg font-extrabold" color={colors.white}>
                        Referral Growth Hub
                    </AppText>
                    <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                        Invite creators, earn recurring rewards from their activity, and climb the leaderboard.
                    </AppText>

                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.14)' }}>
                        <AppText className="text-xs" color="rgba(255,255,255,0.9)">
                            Your Referral Code
                        </AppText>
                        <AppText className="mt-1 text-2xl font-black" color={colors.white}>
                            {loading || !profile ? 'Loading...' : profile.referralCode}
                        </AppText>
                        <AppText className="mt-2 text-xs" color="rgba(255,255,255,0.88)" numberOfLines={1}>
                            {profile?.referralLink ?? 'https://tamkko.app/invite/...'}
                        </AppText>
                    </View>

                    <View className="mt-3 flex-row">
                        <Pressable
                            onPress={handleCopyCode}
                            className="mr-2 flex-1 rounded-xl px-3 py-3"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Copy referral code"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.white}>
                                Copy Code
                            </AppText>
                        </Pressable>
                        <Pressable
                            onPress={() => void handleShareLink()}
                            className="flex-1 rounded-xl px-3 py-3"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Share referral link"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.white}>
                                Share Link
                            </AppText>
                        </Pressable>
                    </View>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Reward Rates
                    </AppText>
                    <View className="mt-3 flex-row">
                        <View className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Standard</AppText>
                            <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>
                                {profile?.rewardRatePercent ?? 5}%
                            </AppText>
                        </View>
                        <View className="ml-2 flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                            <AppText className="text-xs" color={colors.textSecondary}>Ambassador</AppText>
                            <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>
                                {profile?.ambassadorRewardRatePercent ?? 8}%
                            </AppText>
                        </View>
                    </View>
                </View>

                <View className="mt-4 gap-2">
                    {[
                        { label: 'Referral Network', subtitle: 'See all creators who joined via your link.', href: '/referral/network' as const, icon: 'people-outline' as const },
                        { label: 'Referral Earnings', subtitle: 'Track weekly, monthly, and all-time rewards.', href: '/referral/earnings' as const, icon: 'wallet-outline' as const },
                        { label: 'Leaderboard', subtitle: 'Top referrers, fastest growing, and campus leaders.', href: '/referral/leaderboard' as const, icon: 'trophy-outline' as const },
                        { label: 'Campus Ambassador', subtitle: 'Apply and manage ambassador status.', href: '/referral/ambassador' as const, icon: 'school-outline' as const },
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
            </ScrollView>
        </Screen>
    );
}
