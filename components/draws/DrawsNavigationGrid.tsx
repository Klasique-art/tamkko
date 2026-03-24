import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useColors } from '@/config';


import AppText from '@/components/ui/AppText';
const DrawsNavigationGrid = () => {
    const colors = useColors();
    const router = useRouter();

    const menuItems = [
        {
            id: 'history',
            label: 'All Distributions',
            description: 'View full history of all cycles',
            icon: 'time',
            color: colors.error,
            route: '/draws/history' // Placeholder route
        },
        {
            id: 'my-status',
            label: 'My Status',
            description: 'Check your selection history',
            icon: 'person',
            color: colors.accent,
            route: '/draws/my-status' // Placeholder route
        }
    ] as const;

    return (
        <View className="mb-10">
            <AppText
                className="text-lg font-bold mb-4 px-1"
                style={{ color: colors.textPrimary }}
            >
                Transparency & Tools
            </AppText>

            {menuItems.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                        router.push(item.route as any);
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center p-4 mb-3 rounded-2xl border"
                    style={{
                        backgroundColor: colors.backgroundAlt,
                        borderColor: colors.border
                    }}
                >
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${item.color}15` }}
                    >
                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <View className="flex-1">
                        <AppText
                            className="font-bold text-base mb-1"
                            style={{ color: colors.textPrimary }}
                        >
                            {item.label}
                        </AppText>
                        <AppText
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                        >
                            {item.description}
                        </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default DrawsNavigationGrid;
