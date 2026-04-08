import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockReferralService } from '@/lib/services/mockReferralService';
import { LeaderboardCategory, LeaderboardEntry, MyLeaderboardPosition } from '@/types/referral.types';

const tabs: { id: LeaderboardCategory; label: string }[] = [
    { id: 'top_referrers', label: 'Top Referrers' },
    { id: 'fastest_growing', label: 'Fastest Growing' },
    { id: 'campus_leaders', label: 'Campus Leaders' },
];

const formatValue = (entry: LeaderboardEntry) =>
    entry.label.toLowerCase().includes('ghs') ? `GHS ${entry.value.toFixed(1)}` : `${entry.value}`;

export default function ReferralLeaderboardScreen() {
    const colors = useColors();
    const [tab, setTab] = React.useState<LeaderboardCategory>('top_referrers');
    const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
    const [myPositions, setMyPositions] = React.useState<MyLeaderboardPosition[]>([]);

    React.useEffect(() => {
        const load = async () => {
            const [nextEntries, nextPositions] = await Promise.all([
                mockReferralService.getLeaderboard(tab),
                mockReferralService.getMyLeaderboardPosition(),
            ]);
            setEntries(nextEntries);
            setMyPositions(nextPositions);
        };
        void load();
    }, [tab]);

    const myCurrentPosition = myPositions.find((item) => item.category === tab);

    return (
        <Screen title="Leaderboard" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <AppText className="text-lg font-extrabold" color={colors.white}>Referral Leaderboards</AppText>
                    <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                        Compete with creators nationwide and track your rank in real time.
                    </AppText>
                    <View className="mt-3 rounded-xl px-3 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                        <AppText className="text-xs" color="rgba(255,255,255,0.9)">Your Rank</AppText>
                        <AppText className="mt-1 text-xl font-black" color={colors.white}>
                            #{myCurrentPosition?.rank ?? '--'}
                        </AppText>
                        <AppText className="mt-1 text-xs" color="rgba(255,255,255,0.9)">
                            Out of {myCurrentPosition?.totalParticipants ?? '--'} creators
                        </AppText>
                    </View>
                </View>

                <View className="mt-4 flex-row rounded-xl border p-1" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    {tabs.map((item) => {
                        const selected = tab === item.id;
                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => setTab(item.id)}
                                className="flex-1 rounded-lg px-2 py-2"
                                style={{ backgroundColor: selected ? colors.background : 'transparent' }}
                                accessibilityRole="button"
                                accessibilityState={{ selected }}
                                accessibilityLabel={item.label}
                            >
                                <AppText className="text-center text-[11px] font-semibold" color={colors.textPrimary}>
                                    {item.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="mt-3 gap-2">
                    {entries.map((entry) => (
                        <View key={`${tab}-${entry.rank}-${entry.username}`} className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.background }}>
                                        <AppText className="text-xs font-bold" color={colors.textPrimary}>#{entry.rank}</AppText>
                                    </View>
                                    <View className="ml-3">
                                        <View className="flex-row items-center">
                                            <AppText className="text-sm font-bold" color={colors.textPrimary}>{entry.username}</AppText>
                                            {entry.isAmbassador ? (
                                                <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: `${colors.info}1F` }}>
                                                    <AppText className="text-[10px] font-semibold" color={colors.info}>Ambassador</AppText>
                                                </View>
                                            ) : null}
                                        </View>
                                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                            {entry.campus ? `${entry.campus} | ` : ''}{entry.label}
                                        </AppText>
                                    </View>
                                </View>
                                <AppText className="text-base font-bold" color={colors.textPrimary}>{formatValue(entry)}</AppText>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
