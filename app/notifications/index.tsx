import React from 'react';
import { ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockNotifications } from '@/data/mock';

export default function NotificationsScreen() {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Notifications Center</AppText>
                <View className="mt-4 gap-3">
                    {mockNotifications.map((item) => (
                        <View key={item.id} className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="font-semibold" color={colors.textPrimary}>{item.title}</AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.body}</AppText>
                            <AppText className="mt-2 text-[11px]" color={colors.textSecondary}>{new Date(item.createdAt).toLocaleString()}</AppText>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
