import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useColors } from '@/config';
import AppText from '@/components/ui/AppText';

interface DrawEntryStatusProps {
    isEntered: boolean;
    currentPool: number;
    threshold: number;
    winnersCount: number;
}

const DrawEntryStatus = ({ isEntered, currentPool, threshold, winnersCount }: DrawEntryStatusProps) => {
    const colors = useColors();
    const remaining = Math.max(threshold - currentPool, 0);
    const prizePerWinner = Math.floor(threshold / winnersCount);

    return (
        <View
            className="mb-6 rounded-xl border border-dashed p-4"
            style={{
                borderColor: isEntered ? colors.success : colors.border,
                backgroundColor: isEntered ? 'rgba(26, 118, 13, 0.05)' : 'transparent',
            }}
        >
            <View className="flex-row items-start">
                <Ionicons
                    name={isEntered ? 'trophy' : 'alert-circle-outline'}
                    size={24}
                    color={isEntered ? colors.success : colors.textSecondary}
                    style={{ marginTop: 2 }}
                />
                <View className="ml-3 flex-1">
                    <AppText
                        className="text-base font-bold mb-1"
                        style={{ color: colors.textPrimary }}
                    >
                        {isEntered ? "You're eligible for the next distribution!" : 'Contribute to become eligible'}
                    </AppText>
                    <AppText
                        className="text-sm mb-2"
                        style={{ color: colors.textSecondary }}
                    >
                        {isEntered
                            ? `Distribution runs automatically once the pool reaches $${threshold.toLocaleString()}.`
                            : `Stay active so you are included when the pool hits $${threshold.toLocaleString()}.`}
                    </AppText>

                    {isEntered && (
                        <View className="flex-row items-center mt-1">
                            <AppText
                                className="text-xs font-bold px-2 py-1 rounded overflow-hidden"
                                style={{
                                    backgroundColor: colors.accent,
                                    color: colors.white,
                                }}
                            >
                                ${remaining.toLocaleString()} Remaining
                            </AppText>
                            <AppText
                                className="text-xs ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                {winnersCount} Winners | ${prizePerWinner.toLocaleString()} Each
                            </AppText>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default DrawEntryStatus;

