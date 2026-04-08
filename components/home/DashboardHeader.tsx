import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { useNotificationCenter } from '@/context/NotificationCenterContext';

interface DashboardHeaderProps {
    userName: string;
    greeting?: string;
}

const DashboardHeader = ({ userName, greeting }: DashboardHeaderProps) => {
    const colors = useColors();
    const { unreadCount } = useNotificationCenter();
    const currentHour = new Date().getHours();

    const autoGreeting = greeting || (
        currentHour < 12 ? 'Good Morning' :
            currentHour < 18 ? 'Good Afternoon' :
                'Good Evening'
    );

    return (
        <View className="mb-6">
            <View className="mb-2 flex-row items-center justify-between">
                <View className="flex-1">
                    <AppText className="mb-1 text-base" style={{ color: colors.textSecondary }}>
                        {autoGreeting}
                    </AppText>
                    <AppText className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        {userName}
                    </AppText>
                </View>

                <Pressable
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.accent50 }}
                    onPress={() => router.push('/notifications')}
                    accessibilityRole="button"
                    accessibilityLabel="Open notifications"
                    accessibilityHint={`You have ${unreadCount} unread notifications`}
                >
                    <Ionicons name="notifications-outline" size={24} color={colors.white} />
                    {unreadCount > 0 ? (
                        <View
                            className="absolute -right-1 -top-1 min-w-5 items-center rounded-full px-1.5 py-0.5"
                            style={{ backgroundColor: colors.error }}
                        >
                            <AppText className="text-[10px] font-bold" color={colors.white}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </AppText>
                        </View>
                    ) : null}
                </Pressable>
            </View>

            <AppText className="mt-1 text-sm italic" style={{ color: colors.textSecondary }}>
                {'"There Is Power, Real Power In Numbers!"'}
            </AppText>
        </View>
    );
};

export default DashboardHeader;
