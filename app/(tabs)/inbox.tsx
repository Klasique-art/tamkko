import React from 'react';
import { ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockNotifications } from '@/data/mock';

export default function InboxTab() {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Inbox</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>Simulated notification center.</AppText>

                <View className="mt-4 gap-3">
                    {mockNotifications.map((item) => (
                        <View key={item.id} className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View className="flex-row items-center justify-between">
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>{item.title}</AppText>
                                {!item.isRead ? (
                                    <View className="rounded-full px-2 py-1" style={{ backgroundColor: colors.accent }}>
                                        <AppText className="text-[10px] font-semibold" color={colors.white}>NEW</AppText>
                                    </View>
                                ) : null}
                            </View>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>{item.body}</AppText>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
