import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { mockRoomCommunityService } from '@/lib/services/mockRoomCommunityService';
import { VipRoom } from '@/types/room.types';

type RoomFilter = 'all' | 'free' | 'paid' | 'joined';

const formatFee = (fee: number) => (fee === 0 ? 'Free' : `GHS ${fee.toFixed(2)}`);

export default function RoomsHomeScreen() {
    const colors = useColors();
    const [rooms, setRooms] = useState<VipRoom[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<RoomFilter>('all');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const publicRooms = await mockRoomCommunityService.listPublicRooms();
        setRooms(publicRooms);
        setLoading(false);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const filteredRooms = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return rooms.filter((room) => {
            if (filter === 'free' && room.entryFee !== 0) return false;
            if (filter === 'paid' && room.entryFee === 0) return false;
            if (filter === 'joined' && !room.hasJoined) return false;
            if (!normalizedSearch) return true;
            return (
                room.name.toLowerCase().includes(normalizedSearch) ||
                room.description.toLowerCase().includes(normalizedSearch) ||
                room.creatorDisplayName.toLowerCase().includes(normalizedSearch)
            );
        });
    }, [filter, rooms, search]);

    return (
        <Screen title="Browse Rooms" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>
                        Discover VIP Community Rooms
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Browse creator rooms, filter by access type, and open any room to join or enter chat.
                    </AppText>
                </View>

                <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search by room name, topic, or creator"
                        placeholderTextColor={colors.textSecondary}
                        style={{ color: colors.textPrimary, paddingVertical: 12 }}
                        accessibilityLabel="Search rooms"
                        returnKeyType="search"
                    />
                </View>

                <View className="mt-3 flex-row flex-wrap">
                    {(['all', 'free', 'paid', 'joined'] as RoomFilter[]).map((value, index) => {
                        const active = filter === value;
                        return (
                            <Pressable
                                key={value}
                                onPress={() => {
                                    void Haptics.selectionAsync();
                                    setFilter(value);
                                }}
                                className="mb-2 rounded-full border px-3 py-2"
                                style={{
                                    borderColor: active ? colors.accent : colors.border,
                                    backgroundColor: active ? `${colors.accent}20` : colors.backgroundAlt,
                                    marginRight: index === 3 ? 0 : 8,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={`Filter ${value} rooms`}
                            >
                                <AppText className="text-xs font-semibold" color={active ? colors.accent : colors.textPrimary}>
                                    {value === 'all' ? 'All' : value === 'free' ? 'Free' : value === 'paid' ? 'Paid' : 'Joined'}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="mt-2">
                    {loading ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                Loading rooms...
                            </AppText>
                        </View>
                    ) : null}

                    {!loading && filteredRooms.length === 0 ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                No rooms match this filter.
                            </AppText>
                        </View>
                    ) : null}

                    {filteredRooms.map((room) => (
                        <Pressable
                            key={room.id}
                            onPress={() => {
                                void Haptics.selectionAsync();
                                router.push(`/rooms/${room.id}`);
                            }}
                            className="mb-3 rounded-2xl border p-4"
                            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${room.name}`}
                            accessibilityHint={`${formatFee(room.entryFee)} entry and ${room.onlineCount} users online`}
                        >
                            <View className="flex-row items-center justify-between">
                                <AppText className="flex-1 text-base font-bold" color={colors.textPrimary}>
                                    {room.name}
                                </AppText>
                                <View
                                    className="ml-2 rounded-full px-2 py-1"
                                    style={{ backgroundColor: room.status === 'active' ? `${colors.success}20` : `${colors.warning}20` }}
                                >
                                    <AppText
                                        className="text-[11px] font-semibold"
                                        color={room.status === 'active' ? colors.success : colors.warning}
                                    >
                                        {room.status === 'active' ? 'Active' : 'Closed'}
                                    </AppText>
                                </View>
                            </View>

                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                {room.description}
                            </AppText>

                            <View className="mt-3 flex-row items-center justify-between">
                                <View>
                                    <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                        {formatFee(room.entryFee)}
                                    </AppText>
                                    <AppText className="text-xs" color={colors.textSecondary}>
                                        by @{room.creatorUsername}
                                    </AppText>
                                </View>
                                <View>
                                    <AppText className="text-xs text-right" color={colors.textSecondary}>
                                        {room.onlineCount} online
                                    </AppText>
                                    <AppText className="text-xs text-right" color={colors.textSecondary}>
                                        {room.memberCount}/{room.capacity} members
                                    </AppText>
                                </View>
                            </View>

                            <View className="mt-3 flex-row">
                                <View
                                    className="rounded-full px-2 py-1"
                                    style={{ backgroundColor: room.hasJoined ? `${colors.success}20` : `${colors.info}20` }}
                                >
                                    <AppText
                                        className="text-[11px] font-semibold"
                                        color={room.hasJoined ? colors.success : colors.info}
                                    >
                                        {room.hasJoined ? 'Joined' : 'Open details'}
                                    </AppText>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </Screen>
    );
}
