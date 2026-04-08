import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockReferralService } from '@/lib/services/mockReferralService';
import { ReferralNetworkMember } from '@/types/referral.types';

const formatCurrency = (value: number) => `GHS ${value.toFixed(2)}`;

export default function ReferralNetworkScreen() {
    const colors = useColors();
    const [allMembers, setAllMembers] = React.useState<ReferralNetworkMember[]>([]);
    const [query, setQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            setLoading(true);
            const members = await mockReferralService.getNetwork();
            setAllMembers(members);
            setLoading(false);
        };
        void load();
    }, []);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allMembers;
        return allMembers.filter((item) => item.username.toLowerCase().includes(q) || item.displayName.toLowerCase().includes(q));
    }, [allMembers, query]);

    const totals = React.useMemo(() => {
        const totalTips = allMembers.reduce((sum, item) => sum + item.totalTipsGhs, 0);
        const totalRewards = allMembers.reduce((sum, item) => sum + item.rewardEarnedGhs, 0);
        return { totalTips, totalRewards };
    }, [allMembers]);

    return (
        <Screen title="Referral Network" className="pt-2">
            <View className="mb-3 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <View className="flex-row">
                    <View className="flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                        <AppText className="text-xs" color={colors.textSecondary}>Creators Referred</AppText>
                        <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>{allMembers.length}</AppText>
                    </View>
                    <View className="ml-2 flex-1 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                        <AppText className="text-xs" color={colors.textSecondary}>Total Rewards</AppText>
                        <AppText className="mt-1 text-lg font-bold" color={colors.textPrimary}>{formatCurrency(totals.totalRewards)}</AppText>
                    </View>
                </View>
                <View className="mt-2 rounded-xl px-3 py-3" style={{ backgroundColor: colors.background }}>
                    <AppText className="text-xs" color={colors.textSecondary}>Network Tip Volume</AppText>
                    <AppText className="mt-1 text-base font-bold" color={colors.textPrimary}>{formatCurrency(totals.totalTips)}</AppText>
                </View>
            </View>

            <View className="mb-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search referred creators"
                    placeholderTextColor={colors.textSecondary}
                    style={{ color: colors.textPrimary, paddingVertical: 12 }}
                    accessibilityLabel="Search referred creators"
                />
            </View>

            <FlashList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListEmptyComponent={
                    <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>
                            {loading ? 'Loading referral network...' : 'No referred creators found.'}
                        </AppText>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable
                        className="mb-2 rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.displayName}, ${item.username}`}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-2">
                                <View className="flex-row items-center">
                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>{item.displayName}</AppText>
                                    {item.isAmbassador ? (
                                        <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: `${colors.info}1F` }}>
                                            <AppText className="text-[10px] font-semibold" color={colors.info}>Ambassador</AppText>
                                        </View>
                                    ) : null}
                                </View>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.username}</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                    Joined {new Date(item.joinedAt).toLocaleDateString()} {item.campus ? `| ${item.campus}` : ''}
                                </AppText>
                            </View>

                            <View className="items-end">
                                <AppText className="text-xs" color={colors.textSecondary}>Your Reward</AppText>
                                <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                    {formatCurrency(item.rewardEarnedGhs)}
                                </AppText>
                                <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                                    Tips {formatCurrency(item.totalTipsGhs)}
                                </AppText>
                            </View>
                        </View>
                    </Pressable>
                )}
            />
        </Screen>
    );
}
