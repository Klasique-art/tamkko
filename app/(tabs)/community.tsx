import React from 'react';
import { ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockRooms } from '@/data/mock';

export default function CommunityTab() {
    const colors = useColors();

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Community Rooms</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                    Real-time rooms are mocked for now; backend and sockets will be plugged in later.
                </AppText>

                <View className="mt-4 gap-3">
                    {mockRooms.map((room) => (
                        <View key={room.id} className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-base font-semibold" color={colors.textPrimary}>{room.name}</AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>{room.description}</AppText>
                            <View className="mt-3 flex-row items-center justify-between">
                                <AppText className="text-xs" color={colors.textSecondary}>{room.currency} {room.entryFee} entry</AppText>
                                <AppText className="text-xs" color={colors.textSecondary}>{room.onlineCount} online</AppText>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
