import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useColors } from '@/config';


import AppText from '@/components/ui/AppText';
interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    trend?: {
        direction: 'up' | 'down';
        percentage: string;
    };
}

const StatCard = ({ icon, label, value, trend }: StatCardProps) => {
    const colors = useColors();

    return (
        <View
            className="flex-1 rounded-xl p-4"
            style={{ backgroundColor: colors.backgroundAlt }}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${label}: ${value}`}
        >
            <View
                className="w-10 h-10 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: colors.accent50 }}
            >
                <Ionicons name={icon} size={20} color={colors.white} />
            </View>

            <AppText
                className="text-2xl font-bold mb-1"
                style={{ color: colors.textPrimary }}
            >
                {value}
            </AppText>

            <AppText
                className="text-xs mb-2"
                style={{ color: colors.textSecondary }}
            >
                {label}
            </AppText>

            {trend && (
                <View className="flex-row items-center">
                    <Ionicons
                        name={trend.direction === 'up' ? 'trending-up' : 'trending-down'}
                        size={12}
                        color={trend.direction === 'up' ? colors.success : colors.error}
                    />
                    <AppText
                        className="text-xs ml-1"
                        style={{
                            color: trend.direction === 'up' ? colors.success : colors.error
                        }}
                    >
                        {trend.percentage}
                    </AppText>
                </View>
            )}
        </View>
    );
};

interface QuickStatsGridProps {
    totalPool: string;
    participantsCount: number;
    prizePerWinner: string;
    numberOfWinners: number;
    cycleCloseLabel: string;
}

const QuickStatsGrid = ({
    totalPool,
    participantsCount,
    prizePerWinner,
    numberOfWinners,
    cycleCloseLabel,
}: QuickStatsGridProps) => {
    return (
        <View className="mb-6">
            <AppText className="text-lg font-bold mb-3">
                Quick Stats
            </AppText>

            <View className="flex-row gap-3 mb-3">
                <StatCard
                    icon="cash-outline"
                    label="Total Pool"
                    value={totalPool}
                />
                <StatCard
                    icon="people-outline"
                    label="Participants"
                    value={participantsCount.toLocaleString('en-US')}
                />
            </View>

            <View className="flex-row gap-3">
                <StatCard
                    icon="trophy-outline"
                    label={`Prize / Winner (${numberOfWinners} slots)`}
                    value={prizePerWinner}
                />
                <StatCard
                    icon="calendar-outline"
                    label="Cycle Closes"
                    value={cycleCloseLabel}
                />
            </View>
        </View>
    );
};

export default QuickStatsGrid;
