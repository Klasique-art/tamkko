import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { mockRoomCommunityService } from '@/lib/services/mockRoomCommunityService';
import { RoomCodeApplyResult, RoomEntryRequest, VipRoom } from '@/types/room.types';

const formatEntryFee = (fee: number) => (fee === 0 ? 'Free Entry' : `GHS ${fee.toFixed(2)} one-time entry`);

export default function RoomDetailScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    const [room, setRoom] = useState<VipRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [momoNumber, setMomoNumber] = useState('+23324');
    const [codeInput, setCodeInput] = useState('');
    const [codeResult, setCodeResult] = useState<RoomCodeApplyResult | null>(null);
    const [entryRequest, setEntryRequest] = useState<RoomEntryRequest | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const loadRoom = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        const nextRoom = await mockRoomCommunityService.getRoomById(roomId);
        setRoom(nextRoom);
        setLoading(false);
    }, [roomId]);

    React.useEffect(() => {
        void loadRoom();
    }, [loadRoom]);

    const effectiveEntryFee = useMemo(() => {
        if (!room) return 0;
        if (!codeResult) return room.entryFee;
        return codeResult.discountedFeeGhs;
    }, [codeResult, room]);
    const canAccessRoom = useMemo(() => {
        if (!room) return false;
        if (room.role === 'creator') return true;
        if (room.entryFee === 0) return room.hasJoined;
        return room.hasJoined && room.hasPaid;
    }, [room]);

    const handleApplyCode = async () => {
        if (!room || !codeInput.trim()) return;
        const result = await mockRoomCommunityService.applyCreatorCode(room.id, codeInput.trim());
        if (!result) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            showToast('Code is invalid, expired, or exhausted.', { variant: 'warning', duration: 2600 });
            setCodeResult(null);
            return;
        }

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCodeResult(result);
        showToast(result.message, { variant: 'success', duration: 2600 });
    };

    const handleJoinRoom = async () => {
        if (!room || isJoining) return;

        setIsJoining(true);
        const entry = await mockRoomCommunityService.requestRoomEntry(room.id, {
            momoNumber,
            codeString: codeInput.trim() || undefined,
        });
        setIsJoining(false);

        if (!entry || entry.status === 'failed') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast('Unable to initiate room entry. Check input and try again.', { variant: 'error', duration: 2800 });
            return;
        }

        setEntryRequest(entry);

        if (entry.status === 'granted') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showToast('Room access granted. You can enter chat now.', { variant: 'success', duration: 2600 });
            await loadRoom();
            return;
        }

        setShowPaymentModal(true);
        showToast('Payment initiated. Approve fake MoMo prompt.', { variant: 'info', duration: 2400 });
    };

    const handlePollPayment = async () => {
        if (!room || !entryRequest || entryRequest.status !== 'pending') return;

        const next = await mockRoomCommunityService.pollEntryStatus(room.id, entryRequest.entryId);
        if (!next) {
            showToast('Payment status unavailable right now.', { variant: 'warning', duration: 2200 });
            return;
        }

        setEntryRequest(next);

        if (next.status === 'granted') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowPaymentModal(false);
            showToast('Payment confirmed. Room unlocked.', { variant: 'success', duration: 3000 });
            await loadRoom();
        }
    };

    const handleShareRoom = async () => {
        if (!room) return;
        try {
            await Share.share({
                title: room.name,
                message: `Join ${room.name} on Tamkko. ${room.shareUrl}`,
                url: room.shareUrl,
            });
            void Haptics.selectionAsync();
        } catch {
            showToast('Unable to open share options.', { variant: 'warning', duration: 2200 });
        }
    };

    if (loading) {
        return (
            <Screen title="Room Details">
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-sm" color={colors.textSecondary}>
                        Loading room details...
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (!room) {
        return (
            <Screen title="Room Details">
                <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>
                        Room not found
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        This room does not exist or was removed.
                    </AppText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title="Room Details" className="pt-2">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <View className="flex-row items-center justify-between">
                        <AppText className="flex-1 text-xl font-extrabold" color={colors.white}>
                            {room.name}
                        </AppText>
                        <View className="ml-2 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <AppText className="text-xs font-semibold" color={colors.white}>
                                {room.status.toUpperCase()}
                            </AppText>
                        </View>
                    </View>

                    <AppText className="mt-2 text-sm" color={colors.white}>
                        {room.description}
                    </AppText>

                    <View className="mt-3 flex-row flex-wrap">
                        {[
                            { label: 'Entry', value: formatEntryFee(room.entryFee) },
                            { label: 'Online', value: `${room.onlineCount}` },
                            { label: 'Members', value: `${room.memberCount}/${room.capacity}` },
                            { label: 'Creator', value: `@${room.creatorUsername}` },
                        ].map((item) => (
                            <View key={item.label} className="mb-2 w-1/2 pr-2">
                                <View className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                                    <AppText className="text-xs" color={colors.white}>
                                        {item.label}
                                    </AppText>
                                    <AppText className="text-sm font-semibold" color={colors.white}>
                                        {item.value}
                                    </AppText>
                                </View>
                            </View>
                        ))}
                    </View>

                    <AppText className="mt-1 text-xs" color={colors.white}>
                        Welcome note: {room.welcomeMessage || 'Welcome to the community room.'}
                    </AppText>
                </View>

                <View className="mt-4 flex-row">
                    <Pressable
                        onPress={() => {
                            void Haptics.selectionAsync();
                            void handleShareRoom();
                        }}
                        className="mr-2 flex-1 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Share this room"
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="share-social-outline" size={15} color={colors.textPrimary} />
                            <AppText className="ml-1 text-sm font-semibold" color={colors.textPrimary}>
                                Share Room
                            </AppText>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/rooms/joined')}
                        className="flex-1 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="View joined rooms"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Joined Rooms
                        </AppText>
                    </Pressable>
                </View>

                {canAccessRoom ? (
                    <View className="mt-4 rounded-2xl border px-4 py-4" style={{ borderColor: `${colors.success}66`, backgroundColor: `${colors.success}14` }}>
                        <AppText className="text-sm font-semibold" color={colors.success}>
                            Access granted for this room
                        </AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            You are a room member and can enter chat directly.
                        </AppText>

                        <View className="mt-3 flex-row">
                            <Pressable
                                onPress={() => router.push(`/rooms/chat/${room.id}`)}
                                className="mr-2 flex-1 rounded-xl py-3"
                                style={{ backgroundColor: colors.textPrimary }}
                                accessibilityRole="button"
                                accessibilityLabel="Enter room chat"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.background}>
                                    Enter Chat
                                </AppText>
                            </Pressable>

                            {room.role === 'creator' ? (
                                <Pressable
                                    onPress={() => router.push(`/rooms/manage/${room.id}`)}
                                    className="flex-1 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Manage room"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                        Manage Room
                                    </AppText>
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                ) : (
                    <View className="mt-4 rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-base font-bold" color={colors.textPrimary}>
                            Join This Room
                        </AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            Paid rooms require one-time MoMo payment. Free rooms grant instant access.
                        </AppText>

                        <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={codeInput}
                                onChangeText={setCodeInput}
                                placeholder="Creator code (optional)"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="characters"
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                accessibilityLabel="Creator code"
                            />
                        </View>

                        <Pressable
                            onPress={() => {
                                void Haptics.selectionAsync();
                                void handleApplyCode();
                            }}
                            className="mt-2 rounded-xl border py-3"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Apply creator code"
                        >
                            <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                Apply Code
                            </AppText>
                        </Pressable>

                        {codeResult ? (
                            <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: `${colors.success}55`, backgroundColor: `${colors.success}14` }}>
                                <AppText className="text-xs font-semibold" color={colors.success}>
                                    Code {codeResult.codeString} applied
                                </AppText>
                                <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                    New fee: GHS {codeResult.discountedFeeGhs.toFixed(2)} (saved GHS {codeResult.savingsGhs.toFixed(2)})
                                </AppText>
                            </View>
                        ) : null}

                        {effectiveEntryFee > 0 ? (
                            <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                <TextInput
                                    value={momoNumber}
                                    onChangeText={setMomoNumber}
                                    placeholder="MTN MoMo number"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="phone-pad"
                                    style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                    accessibilityLabel="Mobile money number"
                                />
                            </View>
                        ) : null}

                        <AppButton
                            title={`Join Room • GHS ${effectiveEntryFee.toFixed(2)}`}
                            loading={isJoining}
                            onClick={() => {
                                void handleJoinRoom();
                            }}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                )}
            </ScrollView>

            <AppModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Payment Pending">
                <AppText className="text-sm" color={colors.textSecondary}>
                    Entry payment is pending. In this simulation, tap the button below to poll payment status.
                </AppText>

                <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-xs" color={colors.textSecondary}>
                        Entry ID
                    </AppText>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        {entryRequest?.entryId || 'N/A'}
                    </AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                        Status: {entryRequest?.status || 'unknown'}
                    </AppText>
                </View>

                <AppButton title="Check Payment Status" onClick={() => void handlePollPayment()} style={{ marginTop: 12 }} />

                <Pressable
                    onPress={() => setShowPaymentModal(false)}
                    className="mt-2 rounded-xl border py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    accessibilityRole="button"
                    accessibilityLabel="Close payment dialog"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                        Close
                    </AppText>
                </Pressable>
            </AppModal>
        </Screen>
    );
}
