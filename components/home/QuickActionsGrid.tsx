import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useColors } from '@/config';
import { QuickAction } from '@/data/static.home';


import AppText from '@/components/ui/AppText';
interface QuickActionsGridProps {
    actions: (QuickAction & { onPress: () => void })[];
}

const QuickActionsGrid = ({ actions }: QuickActionsGridProps) => {
    const colors = useColors();

    const ActionButton = ({ action }: { action: QuickActionsGridProps['actions'][0] }) => (
        <TouchableOpacity
            onPress={action.onPress}
            className="flex-1 items-center"
            activeOpacity={0.7}
        >
            <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                style={{ backgroundColor: action.color + '20' }}
            >
                <Ionicons name={action.icon} size={28} color={action.color} />
            </View>
            <AppText
                className="text-xs text-center"
                style={{ color: colors.textPrimary }}
                numberOfLines={2}
            >
                {action.label}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <View className="mb-6">
            <AppText
                className="text-lg font-bold mb-3"
                style={{ color: colors.textPrimary }}
            >
                Quick Actions
            </AppText>

            <View
                className="rounded-2xl p-5"
                style={{ backgroundColor: colors.backgroundAlt }}
            >
                <View className="flex-row justify-between mb-4">
                    {actions.slice(0, 4).map((action) => (
                        <ActionButton key={action.id} action={action} />
                    ))}
                </View>

                {actions.length > 4 && (
                    <View className="flex-row justify-between">
                        {actions.slice(4, 8).map((action) => (
                            <ActionButton key={action.id} action={action} />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

export default QuickActionsGrid;
