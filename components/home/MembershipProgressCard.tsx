import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useColors } from '@/config';

import AppText from '@/components/ui/AppText';

interface MembershipProgressCardProps {
    drawId: string;
    monthLabel: string;
    status: string;
    payoutStatus: string;
    lotteryType: string;
    isParticipating: boolean;
    progressPercentage: number;
    remainingToTargetLabel: string;
}

const MembershipProgressCard = ({
    drawId,
    monthLabel,
    status,
    payoutStatus,
    lotteryType,
    isParticipating,
    progressPercentage,
    remainingToTargetLabel,
}: MembershipProgressCardProps) => {
    const colors = useColors();
    const { t } = useTranslation();
    const statusText = status.replace('_', ' ').toUpperCase();
    const payoutText = payoutStatus.replace('_', ' ').toUpperCase();
    const lotteryText = lotteryType.charAt(0).toUpperCase() + lotteryType.slice(1);

    return (
        <LinearGradient
            colors={[colors.primary, colors.primary100]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 mb-6"
            style={{ borderRadius: 16 }}
        >
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                        <Ionicons name="calendar" size={20} color="#FFFFFF" />
                    </View>
                    <AppText className="text-lg font-bold" color={colors.white}>
                        Current Draw
                    </AppText>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                    <AppText className="text-xs font-bold" color={colors.white}>{statusText}</AppText>
                </View>
            </View>

            <View className="mb-4">
                <View className="flex-row items-end justify-between mb-2">
                    <AppText className=" text-4xl font-bold" color={colors.white}>
                        {monthLabel}
                    </AppText>
                    <AppText className="text-base mb-1" color={colors.white}>
                        {drawId}
                    </AppText>
                </View>
                <AppText className="text-sm" color={colors.white}>
                    {lotteryText} draw
                </AppText>
                <AppText className="text-xs mt-1" color={colors.white}>
                    {progressPercentage.toFixed(2)}% to target
                </AppText>
            </View>

            <View
                className="rounded-xl p-3"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
                <View className="">
                    <View className="flex-row items-center">
                        <Ionicons name="cash-outline" size={16} color={colors.white} />
                        <AppText className="text-xs ml-2 flex-1" color={colors.white}>
                            {t('Payout Status: {{status}}', { status: payoutText })}
                        </AppText>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${isParticipating ? 'bg-green-500/80' : 'bg-yellow-500/80'}`}>
                        <AppText className="text-[10px] font-bold" color={colors.white}>
                            {isParticipating ? 'PARTICIPATING' : 'NOT JOINED'}
                        </AppText>
                    </View>
                </View>
                <AppText className="text-xs mt-2" color={colors.white}>
                    {t('Remaining to target: {{amount}}', { amount: remainingToTargetLabel })}
                </AppText>
            </View>
        </LinearGradient>
    );
};

export default MembershipProgressCard;
