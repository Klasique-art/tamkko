import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useColors } from '@/config';
import { ParticipationStats } from '@/data/participationStats.dummy';


import AppText from '@/components/ui/AppText';
interface ParticipationStatsGridProps {
    stats: ParticipationStats;
}

const ParticipationStatsGrid = ({ stats }: ParticipationStatsGridProps) => {
    const colors = useColors();

    const StatItem = ({ label, value, icon, color }: { label: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string }) => (
        <View
            className="flex-1 p-3 rounded-xl mb-3 mr-3 items-start justify-center min-h-[100px]"
            style={{ backgroundColor: colors.backgroundAlt }}
        >
            <View
                className="w-8 h-8 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${color}20` }}
            >
                <Ionicons name={icon} size={16} color={color} />
            </View>
            <AppText
                className="text-2xl font-bold mb-1"
                style={{ color: colors.textPrimary }}
            >
                {value}
            </AppText>
            <AppText
                className="text-xs"
                style={{ color: colors.textSecondary }}
            >
                {label}
            </AppText>
        </View>
    );

    // Calculate duration
    const memberSince = new Date(stats.member_since);
    const now = new Date();
    const months = (now.getFullYear() - memberSince.getFullYear()) * 12 + (now.getMonth() - memberSince.getMonth());
    const durationText = months > 12
        ? `${(months / 12).toFixed(1)} Years`
        : `${months} Months`;

    return (
        <View className="mb-6">
            <AppText
                className="text-lg font-bold mb-3"
                style={{ color: colors.textPrimary }}
            >
                Your Impact
            </AppText>
            <View className="flex-row flex-wrap -mr-3">
                <View className="w-1/2 pr-3">
                    <StatItem
                        label="Total Contributed"
                        value={`$${stats.total_contributed_amount}`}
                        icon="wallet"
                        color={colors.error}
                    />
                </View>
                <View className="w-1/2 pr-3">
                    <StatItem
                        label="Draw Entries"
                        value={stats.total_draw_entries}
                        icon="ticket"
                        color={colors.accent}
                    />
                </View>
                <View className="w-1/2 pr-3">
                    <StatItem
                        label="Friends Invited"
                        value={stats.successful_referrals}
                        icon="people"
                        color={colors.success}
                    />
                </View>
                <View className="w-1/2 pr-3">
                    <StatItem
                        label="Member Since"
                        value={durationText}
                        icon="calendar"
                        color={colors.info}
                    />
                </View>
            </View>
        </View>
    );
};

export default ParticipationStatsGrid;
