import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { roomService } from '@/lib/services/roomService';
import { VipRoom } from '@/types/room.types';

const formatTimeAgo = (dateIso?: string) => {
    if (!dateIso) return 'Recently';
    const deltaMs = Date.now() - new Date(dateIso).getTime();
    const minutes = Math.max(1, Math.floor(deltaMs / (1000 * 60)));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export default function JoinedRoomsScreen() {
    const colors = useColors();
    const [rooms, setRooms] = useState<VipRoom[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await roomService.listJoinedRooms({ limit: 50 });
            setRooms(response.rooms);
        } catch {
            setRooms([]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    return (
        <Screen title="Joined Rooms" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>
                        Your Communities
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Rooms you have already joined. Tap any room to jump back into the conversation.
                    </AppText>
                </View>

                <View className="mt-4">
                    {loading ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                Loading joined rooms...
                            </AppText>
                        </View>
                    ) : null}

                    {!loading && rooms.length === 0 ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                You have not joined any rooms yet.
                            </AppText>
                            <Pressable
                                onPress={() => router.push('/rooms')}
                                className="mt-3 rounded-xl border py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Browse rooms"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                    Browse Rooms
                                </AppText>
                            </Pressable>
                        </View>
                    ) : null}

                    {rooms.map((room) => (
                        <Pressable
                            key={room.id}
                            onPress={() => {
                                void Haptics.selectionAsync();
                                router.push(`/rooms/${room.id}`);
                            }}
                            className="mb-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            accessibilityRole="button"
                            accessibilityLabel={`Open joined room ${room.name}`}
                        >
                            <View className="flex-row items-center justify-between">
                                <AppText className="flex-1 text-base font-bold" color={colors.textPrimary}>
                                    {room.name}
                                </AppText>
                                {room.hasUnread ? (
                                    <View className="rounded-full px-2 py-1" style={{ backgroundColor: `${colors.accent}25` }}>
                                        <AppText className="text-[11px] font-semibold" color={colors.accent}>
                                            Unread
                                        </AppText>
                                    </View>
                                ) : null}
                            </View>

                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                @{room.creatorUsername} • {room.onlineCount} online • last activity {formatTimeAgo(room.lastActivityAt)}
                            </AppText>

                            <View className="mt-3 flex-row items-center justify-between">
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    {room.entryFee === 0 ? 'Free room' : `Paid room • GHS ${room.entryFee.toFixed(2)}`}
                                </AppText>
                                <View className="rounded-full px-2 py-1" style={{ backgroundColor: `${colors.success}20` }}>
                                    <AppText className="text-[11px] font-semibold" color={colors.success}>
                                        Access granted
                                    </AppText>
                                </View>
                            </View>

                            <View className="mt-3 flex-row">
                                <Pressable
                                    onPress={() => router.push(`/rooms/chat/${room.id}`)}
                                    className="mr-2 flex-1 rounded-xl py-3"
                                    style={{ backgroundColor: colors.textPrimary }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Enter chat for ${room.name}`}
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.background}>
                                        Enter Chat
                                    </AppText>
                                </Pressable>
                                <Pressable
                                    onPress={() => router.push(`/rooms/${room.id}`)}
                                    className="flex-1 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Open details for ${room.name}`}
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                        Room Details
                                    </AppText>
                                </Pressable>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
