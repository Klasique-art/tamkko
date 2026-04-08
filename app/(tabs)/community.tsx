import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockRoomCommunityService } from '@/lib/services/mockRoomCommunityService';
import { VipRoom } from '@/types/room.types';

const formatEntryFee = (entryFee: number) => (entryFee === 0 ? 'Free entry' : `GHS ${entryFee.toFixed(2)} entry`);

const RoomPreviewCard = ({ room, onPress }: { room: VipRoom; onPress: (roomId: string) => void }) => {
    const colors = useColors();

    return (
        <Pressable
            onPress={() => onPress(room.id)}
            className="mb-3 rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
            accessibilityRole="button"
            accessibilityLabel={`${room.name}. ${formatEntryFee(room.entryFee)}`}
            accessibilityHint="Opens room details"
        >
            <View className="flex-row items-center justify-between">
                <AppText className="flex-1 text-base font-bold" color={colors.textPrimary}>
                    {room.name}
                </AppText>
                <View
                    className="ml-2 rounded-full px-2 py-1"
                    style={{ backgroundColor: room.hasJoined ? `${colors.success}20` : `${colors.warning}20` }}
                >
                    <AppText className="text-xs font-semibold" color={room.hasJoined ? colors.success : colors.warning}>
                        {room.hasJoined ? 'Joined' : 'Not Joined'}
                    </AppText>
                </View>
            </View>

            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                {room.description}
            </AppText>

            <View className="mt-3 flex-row items-center justify-between">
                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                    {formatEntryFee(room.entryFee)}
                </AppText>
                <AppText className="text-xs" color={colors.textSecondary}>
                    {room.onlineCount} online • {room.memberCount} members
                </AppText>
            </View>
        </Pressable>
    );
};

export default function CommunityTab() {
    const colors = useColors();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [publicRooms, setPublicRooms] = useState<VipRoom[]>([]);
    const [joinedRooms, setJoinedRooms] = useState<VipRoom[]>([]);
    const [creatorRooms, setCreatorRooms] = useState<VipRoom[]>([]);
    const [overview, setOverview] = useState({ publicRooms: 0, joinedRooms: 0, onlineNow: 0, activeCreators: 0 });

    const load = useCallback(async (isPullRefresh = false) => {
        if (isPullRefresh) {
            setRefreshing(true);
        } else {
            setIsLoading(true);
        }

        const [nextPublicRooms, nextJoinedRooms, nextCreatorRooms, nextOverview] = await Promise.all([
            mockRoomCommunityService.listPublicRooms(),
            mockRoomCommunityService.listJoinedRooms(),
            mockRoomCommunityService.listMyCreatorRooms(),
            mockRoomCommunityService.getCommunityOverview(),
        ]);

        setPublicRooms(nextPublicRooms);
        setJoinedRooms(nextJoinedRooms);
        setCreatorRooms(nextCreatorRooms);
        setOverview(nextOverview);
        setRefreshing(false);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const quickActions = useMemo(
        () => [
            { label: 'Browse Rooms', onPress: () => router.push('/rooms') },
            { label: 'Joined Rooms', onPress: () => router.push('/rooms/joined') },
            { label: 'Create Room', onPress: () => router.push('/rooms/create') },
        ],
        []
    );

    const handleOpenRoom = useCallback((roomId: string) => {
        void Haptics.selectionAsync();
        router.push(`/rooms/${roomId}`);
    }, []);

    return (
        <Screen className="pt-3" title="Community">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accent} />}
            >
                <View
                    className="rounded-3xl border px-4 py-4"
                    style={{ borderColor: colors.border, backgroundColor: colors.primary }}
                >
                    <AppText className="text-lg font-extrabold" color={colors.white}>
                        VIP Community Rooms
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.white}>
                        Discover creator rooms, join live communities, and manage your own room experiences.
                    </AppText>

                    <View className="mt-3 flex-row flex-wrap">
                        {[
                            { label: 'Public Rooms', value: overview.publicRooms },
                            { label: 'Joined', value: overview.joinedRooms },
                            { label: 'Online Now', value: overview.onlineNow },
                            { label: 'Creators', value: overview.activeCreators },
                        ].map((stat) => (
                            <View key={stat.label} className="mb-2 w-1/2 pr-2">
                                <View className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                                    <AppText className="text-base font-bold" color={colors.white}>
                                        {stat.value}
                                    </AppText>
                                    <AppText className="text-xs" color={colors.white}>
                                        {stat.label}
                                    </AppText>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="mt-4 flex-row">
                    {quickActions.map((action, index) => (
                        <Pressable
                            key={action.label}
                            onPress={() => {
                                void Haptics.selectionAsync();
                                action.onPress();
                            }}
                            className="flex-1 rounded-xl border px-3 py-3"
                            style={{
                                borderColor: colors.border,
                                backgroundColor: colors.backgroundAlt,
                                marginRight: index === quickActions.length - 1 ? 0 : 8,
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={action.label}
                        >
                            <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>
                                {action.label}
                            </AppText>
                        </Pressable>
                    ))}
                </View>

                <View className="mt-5">
                    <View className="mb-2 flex-row items-center justify-between">
                        <AppText className="text-base font-bold" color={colors.textPrimary}>
                            Continue Where You Left Off
                        </AppText>
                        <Pressable onPress={() => router.push('/rooms/joined')} accessibilityRole="button" accessibilityLabel="Open joined rooms">
                            <AppText className="text-xs font-semibold" color={colors.accent}>
                                See all
                            </AppText>
                        </Pressable>
                    </View>

                    {joinedRooms.length === 0 ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                You have not joined any rooms yet.
                            </AppText>
                        </View>
                    ) : (
                        joinedRooms.slice(0, 2).map((room) => <RoomPreviewCard key={room.id} room={room} onPress={handleOpenRoom} />)
                    )}
                </View>

                <View className="mt-2">
                    <View className="mb-2 flex-row items-center justify-between">
                        <AppText className="text-base font-bold" color={colors.textPrimary}>
                            Discover Public Rooms
                        </AppText>
                        <Pressable onPress={() => router.push('/rooms')} accessibilityRole="button" accessibilityLabel="Browse all rooms">
                            <AppText className="text-xs font-semibold" color={colors.accent}>
                                Explore
                            </AppText>
                        </Pressable>
                    </View>
                    {publicRooms.length === 0 ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                No rooms are available right now.
                            </AppText>
                        </View>
                    ) : (
                        publicRooms.slice(0, 4).map((room) => <RoomPreviewCard key={room.id} room={room} onPress={handleOpenRoom} />)
                    )}
                </View>

                <View className="mt-2">
                    <View className="mb-2 flex-row items-center justify-between">
                        <AppText className="text-base font-bold" color={colors.textPrimary}>
                            Your Creator Rooms
                        </AppText>
                        <Pressable onPress={() => router.push('/rooms/create')} accessibilityRole="button" accessibilityLabel="Create room">
                            <AppText className="text-xs font-semibold" color={colors.accent}>
                                New room
                            </AppText>
                        </Pressable>
                    </View>
                    {creatorRooms.length === 0 ? (
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                You have not created any room yet. Create your first VIP room.
                            </AppText>
                        </View>
                    ) : (
                        creatorRooms.map((room) => <RoomPreviewCard key={room.id} room={room} onPress={handleOpenRoom} />)
                    )}
                </View>

                {isLoading ? (
                    <View className="mt-2 rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm" color={colors.textSecondary}>
                            Loading community rooms...
                        </AppText>
                    </View>
                ) : null}

                <Pressable
                    onPress={() => {
                        showToast('Community refreshed', { variant: 'success', duration: 1800 });
                        void load(true);
                    }}
                    className="mt-2 rounded-xl border py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh community data"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                        Refresh Community Data
                    </AppText>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}
