import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useColors } from '@/config';
import { DistributionCycle } from '@/data/dummy.draws';


import AppText from '@/components/ui/AppText';
interface LatestDistributionCardProps {
    cycle: DistributionCycle;
    onPress: () => void;
}

const LatestDistributionCard = ({ cycle, onPress }: LatestDistributionCardProps) => {
    const colors = useColors();

    if (!cycle) return null;

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-1">
                <AppText
                    className="text-lg font-bold"
                    style={{ color: colors.textPrimary }}
                >
                    Latest Distribution
                </AppText>
                <TouchableOpacity onPress={onPress}>
                    <AppText className='underline' style={{ fontWeight: '600' }}>
                        View All
                    </AppText>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                className="rounded-2xl p-5 border shadow-sm"
                style={{
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.border
                }}
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <AppText
                            className="text-xl font-bold mb-1"
                            style={{ color: colors.textPrimary }}
                        >
                            {cycle.period}
                        </AppText>
                        <AppText style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>
                            <Ionicons name="checkmark-circle" size={14} /> Completed
                        </AppText>
                    </View>
                    <View className="items-end">
                        <AppText
                            className="font-bold text-lg"
                            style={{ color: colors.textPrimary }}
                        >
                            ${cycle.total_pool.toLocaleString()}
                        </AppText>
                        <AppText style={{ color: colors.textSecondary, fontSize: 12 }}>
                            Total Distributed
                        </AppText>
                    </View>
                </View>

                {/* Beneficiary Preview */}
                <View
                    className="rounded-xl p-3 flex-row items-center justify-between"
                    style={{ backgroundColor: colors.background }}
                >
                    <View className="flex-row -space-x-2">
                        {/* Avatar Placeholders */}
                        {[1, 2, 3].map((_, i) => (
                            <View
                                key={i}
                                className="w-8 h-8 rounded-full border-2 justify-center items-center"
                                style={{
                                    backgroundColor: colors.primary,
                                    borderColor: colors.background,
                                    zIndex: 3 - i
                                }}
                            >
                                <Ionicons name="person" size={14} color="#FFF" />
                            </View>
                        ))}
                    </View>
                    <AppText style={{ color: colors.textSecondary }}>
                        <AppText style={{ fontWeight: 'bold', color: colors.textPrimary }}>
                            {cycle.beneficiaries_count} Beneficiaries
                        </AppText> selected
                    </AppText>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default LatestDistributionCard;
