import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, TextInput, View } from 'react-native';

import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { roomService } from '@/lib/services/roomService';
import { VipRoom } from '@/types/room.types';

const formatEntryFee = (fee: number) => (fee === 0 ? 'Free Entry' : `GHS ${fee.toFixed(2)} one-time entry`);

export default function RoomDetailScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    const [room, setRoom] = useState<VipRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [codeInput, setCodeInput] = useState('');
    const [preview, setPreview] = useState<{
        codeString: string;
        originalAmount: number;
        discountAmount: number;
        payableAmount: number;
        message: string;
    } | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [previewing, setPreviewing] = useState(false);

    const loadRoom = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        try {
            const nextRoom = await roomService.getRoom(roomId);
            setRoom(nextRoom);
        } catch {
            setRoom(null);
        }
        setLoading(false);
    }, [roomId]);

    React.useEffect(() => {
        void loadRoom();
    }, [loadRoom]);

    const currentUserId = String(user?._id ?? user?.user_id ?? '');
    const isCreator = useMemo(() => {
        if (!room) return false;
        return Boolean(
            room.role === 'creator' ||
            (currentUserId && room.creatorId === currentUserId) ||
            (user?.username && room.creatorUsername === user.username)
        );
    }, [room, currentUserId, user?.username]);

    const canAccessRoom = useMemo(() => {
        if (!room) return false;
        if (isCreator) return true;
        if (room.entryFee === 0) return room.hasJoined;
        return room.hasJoined && room.hasPaid;
    }, [room, isCreator]);

    const handleJoinRoom = async () => {
        if (!room || isJoining) return;

        try {
            setIsJoining(true);
            const result = await roomService.joinRoom(room.id, codeInput.trim() ? { code_string: codeInput.trim() } : undefined);
            if (!result?.joined) {
                if (result?.paymentRequired) {
                    showToast(
                        `Payment required. Payable: GHS ${result.payableAmount.toFixed(2)}${result.discountAmount > 0 ? ` (saved GHS ${result.discountAmount.toFixed(2)})` : ''}.`,
                        { variant: 'info', duration: 3400 }
                    );
                    return;
                }
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                showToast(result?.message || 'Unable to join this room right now.', { variant: 'warning', duration: 2800 });
                return;
            }
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showToast(result?.message || 'Room joined successfully.', { variant: 'success', duration: 2600 });
            await loadRoom();
        } catch {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast('Unable to join room right now.', { variant: 'error', duration: 2800 });
        } finally {
            setIsJoining(false);
        }
    };

    const handlePreviewCode = async () => {
        if (!room || !codeInput.trim() || previewing) return;
        try {
            setPreviewing(true);
            const result = await roomService.previewPromoCode(room.id, codeInput.trim());
            setPreview(result);
            showToast(result.message, { variant: 'success', duration: 2200 });
        } catch {
            setPreview(null);
            showToast('Promo code is invalid, expired, or exhausted.', { variant: 'warning', duration: 2600 });
        } finally {
            setPreviewing(false);
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
                            { label: 'Creator', value: isCreator ? 'You' : `@${room.creatorUsername}` },
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
                        className="flex-1 rounded-xl border py-3"
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
                            {isCreator ? (
                                <Pressable
                                    onPress={() => router.push(`/rooms/manage/${room.id}`)}
                                    className="mr-2 flex-1 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Manage room"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                        Manage Room
                                    </AppText>
                                </Pressable>
                            ) : null}

                            <Pressable
                                onPress={() => router.push(`/rooms/chat/${room.id}`)}
                                className="flex-1 rounded-xl py-3"
                                style={{ backgroundColor: colors.textPrimary }}
                                accessibilityRole="button"
                                accessibilityLabel="Enter room chat"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.background}>
                                    Enter Chat
                                </AppText>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View className="mt-4 rounded-2xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-base font-bold" color={colors.textPrimary}>
                            Join This Room
                        </AppText>
                        {room.entryFee > 0 ? (
                            <>
                                <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                    For paid rooms, backend handles payment and access. Add a promo code if you have one.
                                </AppText>

                                <View className="mt-3 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                                    <TextInput
                                        value={codeInput}
                                        onChangeText={(value) => {
                                            setCodeInput(value);
                                            setPreview(null);
                                        }}
                                        placeholder="Promo code (optional)"
                                        placeholderTextColor={colors.textSecondary}
                                        autoCapitalize="characters"
                                        style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                        accessibilityLabel="Promo code"
                                    />
                                </View>

                                <Pressable
                                    onPress={() => {
                                        void Haptics.selectionAsync();
                                        void handlePreviewCode();
                                    }}
                                    className="mt-2 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Preview promo code"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                        {previewing ? 'Checking...' : 'Apply Promo Code'}
                                    </AppText>
                                </Pressable>

                                {preview ? (
                                    <View className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: `${colors.success}55`, backgroundColor: `${colors.success}14` }}>
                                        <AppText className="text-xs font-semibold" color={colors.success}>
                                            Code {preview.codeString} applied
                                        </AppText>
                                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                            Original: GHS {preview.originalAmount.toFixed(2)} • Discount: GHS {preview.discountAmount.toFixed(2)} • Payable: GHS {preview.payableAmount.toFixed(2)}
                                        </AppText>
                                    </View>
                                ) : null}
                            </>
                        ) : (
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                This room is free to join.
                            </AppText>
                        )}

                        <AppButton
                            title={`Join Room${room.entryFee > 0 ? ` • GHS ${(preview?.payableAmount ?? room.entryFee).toFixed(2)}` : ''}`}
                            loading={isJoining}
                            onClick={() => {
                                void handleJoinRoom();
                            }}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}
