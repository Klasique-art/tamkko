import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    AccessibilityInfo,
    Animated,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { mockRoomCommunityService } from '@/lib/services/mockRoomCommunityService';
import { roomService } from '@/lib/services/roomService';
import { RoomChatMessage, RoomMember, VipRoom } from '@/types/room.types';

const REACTIONS: { emoji: string; label: string }[] = [
    { emoji: '\u{1F525}', label: 'Fire' },
    { emoji: '\u{1F44F}', label: 'Clap' },
    { emoji: '\u{1F389}', label: 'Celebrate' },
    { emoji: '\u{1F4AF}', label: 'Hundred' },
    { emoji: '\u{2764}\u{FE0F}', label: 'Love' },
];

const formatMessageTime = (iso: string) => {
    const date = new Date(iso);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

export default function RoomChatScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const { roomId } = useLocalSearchParams<{ roomId: string }>();

    const [room, setRoom] = useState<VipRoom | null>(null);
    const [messages, setMessages] = useState<RoomChatMessage[]>([]);
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showTipModal, setShowTipModal] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [tipAmount, setTipAmount] = useState('20');
    const [tipMessage, setTipMessage] = useState('Thanks for building this room.');
    const [floatingReaction, setFloatingReaction] = useState<string | null>(null);
    const [submittingMessage, setSubmittingMessage] = useState(false);
    const [submittingTip, setSubmittingTip] = useState(false);
    const [keyboardInset, setKeyboardInset] = useState(0);

    const listRef = useRef<FlatList<RoomChatMessage> | null>(null);
    const bubbleAnimations = useRef<Record<string, Animated.Value>>({});

    const load = useCallback(async () => {
        if (!roomId) return;

        setLoading(true);
        try {
            const [nextRoom, nextMessages, nextMembers] = await Promise.all([
                roomService.getRoom(roomId),
                mockRoomCommunityService.getRoomMessages(roomId),
                mockRoomCommunityService.getRoomMembers(roomId),
            ]);
            setRoom(nextRoom);
            setMessages(nextMessages);
            setMembers(nextMembers);
        } catch {
            setRoom(null);
            setMessages([]);
            setMembers([]);
        }
        setLoading(false);
    }, [roomId]);

    React.useEffect(() => {
        void load();
    }, [load]);

    React.useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
            setKeyboardInset(event.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardInset(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const pinnedMessage = useMemo(() => messages.find((message) => message.isPinned) ?? null, [messages]);

    const appendMessage = (message: RoomChatMessage | null) => {
        if (!message) return;

        if (message.senderId === 'usr_you' && message.type === 'text') {
            const anim = new Animated.Value(0);
            bubbleAnimations.current[message.id] = anim;
            Animated.spring(anim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 24,
                bounciness: 7,
            }).start();
        }

        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 50);
    };

    const refreshMembers = useCallback(async () => {
        if (!roomId) return;
        const nextMembers = await mockRoomCommunityService.getRoomMembers(roomId);
        setMembers(nextMembers);
    }, [roomId]);

    const handleSendMessage = async () => {
        if (!roomId || !messageText.trim() || submittingMessage) return;
        setSubmittingMessage(true);
        const sent = await mockRoomCommunityService.sendMessage(roomId, messageText);
        setSubmittingMessage(false);

        if (!sent) {
            showToast('Message could not be sent. You may be muted.', { variant: 'warning', duration: 2400 });
            return;
        }

        appendMessage(sent);
        setMessageText('');
        Keyboard.dismiss();
        void Haptics.selectionAsync();
    };

    const handleSendReaction = async (emoji: string) => {
        if (!roomId) return;
        const reaction = await mockRoomCommunityService.sendReaction(roomId, emoji);
        if (!reaction) {
            showToast('Unable to send reaction.', { variant: 'warning', duration: 1800 });
            return;
        }
        setFloatingReaction(emoji);
        AccessibilityInfo.announceForAccessibility(`${REACTIONS.find((item) => item.emoji === emoji)?.label ?? 'Reaction'} reaction sent`);
        void Haptics.selectionAsync();
        setTimeout(() => setFloatingReaction(null), 900);
    };

    const handlePinMessage = async (messageId: string) => {
        if (!roomId) return;
        const pinned = await mockRoomCommunityService.pinMessage(roomId, messageId);
        if (!pinned) return;
        const latest = await mockRoomCommunityService.getRoomMessages(roomId);
        setMessages(latest);
        showToast('Pinned message updated.', { variant: 'success', duration: 1800 });
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!roomId) return;
        const deleted = await mockRoomCommunityService.deleteMessage(roomId, messageId);
        if (!deleted) return;
        setMessages((prev) => prev.filter((message) => message.id !== messageId));
        showToast('Message deleted.', { variant: 'info', duration: 1600 });
    };

    const handleMuteMember = async (member: RoomMember, muted: boolean) => {
        if (!roomId) return;
        await mockRoomCommunityService.muteMember(roomId, member.id, muted);
        await refreshMembers();
        showToast(`${member.displayName} ${muted ? 'muted' : 'unmuted'}.`, { variant: 'info', duration: 2000 });
    };

    const handleKickMember = async (member: RoomMember) => {
        if (!roomId) return;
        await mockRoomCommunityService.kickMember(roomId, member.id);
        await refreshMembers();
        showToast(`${member.displayName} removed from room.`, { variant: 'warning', duration: 2200 });
    };

    const handleSendTip = async () => {
        if (!roomId || submittingTip) return;
        const amount = Number(tipAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            showToast('Enter a valid tip amount.', { variant: 'warning', duration: 2000 });
            return;
        }

        setSubmittingTip(true);
        const result = await mockRoomCommunityService.sendTip(roomId, amount, tipMessage);
        setSubmittingTip(false);

        if (!result) {
            showToast('Unable to process tip for this room.', { variant: 'warning', duration: 2200 });
            return;
        }

        appendMessage(result.systemMessage);
        setShowTipModal(false);
        Keyboard.dismiss();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`Tip sent: GHS ${amount.toFixed(2)}.`, { variant: 'success', duration: 2200 });
    };

    const handleDeleteGroup = async () => {
        if (!room || !isCreator) return;
        try {
            const ok = await roomService.deleteRoom(room.id);
            if (!ok) {
                showToast('Unable to delete group right now.', { variant: 'error', duration: 2200 });
                return;
            }
            setShowHeaderMenu(false);
            showToast('Group deleted.', { variant: 'success', duration: 2200 });
            router.replace('/rooms');
        } catch {
            showToast('Unable to delete group right now.', { variant: 'error', duration: 2200 });
        }
    };

    const handleLeaveGroup = async () => {
        setShowHeaderMenu(false);
        showToast('Leave group is pending backend endpoint.', { variant: 'info', duration: 2400 });
    };

    const currentUserId = String(user?._id ?? user?.user_id ?? '');
    const isCreator = Boolean(
        room &&
        (
            room.role === 'creator' ||
            (currentUserId && room.creatorId === currentUserId) ||
            (user?.username && room.creatorUsername === user.username)
        )
    );
    const canAccessRoom = Boolean(
        room && (isCreator || room.entryFee === 0 ? room.hasJoined : room.hasJoined && room.hasPaid)
    );

    if (loading) {
        return (
            <Screen title="Room Chat">
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-sm" color={colors.textSecondary}>
                        Loading room chat...
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (!room) {
        return (
            <Screen title="Room Chat">
                <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-base font-bold" color={colors.textPrimary}>
                        Room not found
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (!canAccessRoom) {
        return (
            <Screen title="Room Chat">
                <View className="rounded-xl border px-4 py-4" style={{ borderColor: `${colors.warning}66`, backgroundColor: `${colors.warning}14` }}>
                    <AppText className="text-base font-bold" color={colors.warning}>
                        Access required
                    </AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        You must complete room access before entering this chat.
                    </AppText>
                    <Pressable
                        onPress={() => {
                            router.push(`/rooms/${room.id}`);
                        }}
                        className="mt-3 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Open room access page"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Open Room Access
                        </AppText>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    const renderMessageItem = ({ item }: { item: RoomChatMessage }) => {
        const isSystem = item.type !== 'text';
        const isMine = item.senderId === 'usr_you';
        const mineBubbleBg = isSystem ? `${colors.info}16` : colors.accent;
        const otherBubbleBg = isSystem ? `${colors.info}16` : colors.backgroundAlt;
        const bubbleAnim = bubbleAnimations.current[item.id];
        const bubbleAnimatedStyle = bubbleAnim
            ? {
                opacity: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                transform: [
                    {
                        scale: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
                    },
                ],
            }
            : undefined;

        return (
            <View className="mb-3">
                <Animated.View
                    className={`max-w-[88%] px-4 py-3 ${isMine ? 'self-end rounded-t-2xl rounded-bl-2xl rounded-br-md' : 'self-start rounded-t-2xl rounded-br-2xl rounded-bl-md'}`}
                    style={{
                        backgroundColor: isMine ? mineBubbleBg : otherBubbleBg,
                        borderWidth: isSystem || !isMine ? 1 : 0,
                        borderColor: isSystem ? `${colors.info}30` : `${colors.border}88`,
                        shadowColor: '#000000',
                        shadowOpacity: isMine ? 0.06 : 0.03,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: isMine ? 2 : 1,
                        borderRadius: 22,
                        borderBottomRightRadius: isMine ? 8 : 22,
                        borderBottomLeftRadius: isMine ? 22 : 8,
                        ...(bubbleAnimatedStyle || {}),
                    }}
                >
                    {!isMine ? (
                        <AppText className="text-xs font-semibold" color={isSystem ? colors.info : colors.textSecondary}>
                            {isSystem ? 'System' : `@${item.senderUsername}`}
                        </AppText>
                    ) : null}

                    <AppText className="text-[14px]" color={isMine ? colors.background : colors.textPrimary}>
                        {isSystem ? `${item.senderDisplayName} ${item.text}` : item.text}
                    </AppText>

                    <View className="flex-row items-center justify-between" style={{ marginTop: 1 }}>
                        <AppText
                            allowFontScaling={false}
                            style={{ fontSize: isMine ? 8 : 9, lineHeight: isMine ? 10 : 11 }}
                            color={isMine ? `${colors.background}C7` : `${colors.textSecondary}CC`}
                        >
                            {formatMessageTime(item.createdAt)}
                        </AppText>
                        {item.isPinned ? (
                            <View className="flex-row items-center">
                                <Ionicons name="pin" size={11} color={isMine ? colors.background : colors.accent} />
                                <AppText className="ml-1 text-[11px] font-semibold" color={isMine ? colors.background : colors.accent}>
                                    Pinned
                                </AppText>
                            </View>
                        ) : null}
                    </View>
                </Animated.View>

                {isCreator && !isSystem ? (
                    <View className={`mt-1 flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <Pressable
                            onPress={() => {
                                void handlePinMessage(item.id);
                            }}
                            className="mr-2 rounded-full px-2 py-1"
                            style={{ backgroundColor: `${colors.accent}20` }}
                            accessibilityRole="button"
                            accessibilityLabel="Pin message"
                        >
                            <AppText className="text-[11px] font-semibold" color={colors.accent}>
                                Pin
                            </AppText>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                void handleDeleteMessage(item.id);
                            }}
                            className="rounded-full px-2 py-1"
                            style={{ backgroundColor: `${colors.error}18` }}
                            accessibilityRole="button"
                            accessibilityLabel="Delete message"
                        >
                            <AppText className="text-[11px] font-semibold" color={colors.error}>
                                Delete
                            </AppText>
                        </Pressable>
                    </View>
                ) : null}
            </View>
        );
    };

    return (
        <Screen
            title={room.name || 'Room'}
            className="pt-2"
            topNavRight={
                <Pressable
                    onPress={() => setShowHeaderMenu((prev) => !prev)}
                    className="h-10 w-10 items-center justify-center rounded-full"
                    accessibilityRole="button"
                    accessibilityLabel="Open room options"
                    accessibilityHint="Shows room actions in a dropdown menu"
                    accessibilityState={{ expanded: showHeaderMenu }}
                    hitSlop={8}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
                </Pressable>
            }
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                style={{ flex: 1 }}
            >
                <View className="mb-2 rounded-xl border px-3 py-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-2">
                            <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                {room.onlineCount} online | {members.length} members
                            </AppText>
                            <AppText className="text-xs" color={colors.textSecondary}>
                                {room.allowTips ? 'Tips enabled' : 'Tips disabled'}
                            </AppText>
                        </View>

                        <View className="flex-row">
                            <Pressable
                                onPress={() => setShowMembersModal(true)}
                                className="mr-2 rounded-xl border px-3 py-2"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Open members list"
                            >
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    Members
                                </AppText>
                            </Pressable>
                            <Pressable
                                onPress={() => setShowTipModal(true)}
                                className="rounded-xl border px-3 py-2"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Send room tip"
                            >
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                    Tip
                                </AppText>
                            </Pressable>
                        </View>
                    </View>

                    {pinnedMessage ? (
                        <View className="mt-3 rounded-xl border px-3 py-2" style={{ borderColor: `${colors.accent}44`, backgroundColor: `${colors.accent}15` }}>
                            <View className="flex-row items-center">
                                <Ionicons name="pin" size={12} color={colors.accent} />
                                <AppText className="ml-1 text-xs font-semibold" color={colors.accent}>
                                    Pinned Message
                                </AppText>
                            </View>
                            <AppText className="mt-1 text-sm" color={colors.textPrimary}>
                                {pinnedMessage.text}
                            </AppText>
                        </View>
                    ) : null}
                </View>

                <FlatList
                    ref={listRef}
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={12}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    ListEmptyComponent={
                        <View className="rounded-xl border px-4 py-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                No messages yet. Say hello to the community.
                            </AppText>
                        </View>
                    }
                />

                <View
                    className="mt-1 rounded-2xl border px-2 pb-2 pt-1.5"
                    style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        marginBottom:
                            Platform.OS === 'android'
                                ? keyboardInset > 0
                                    ? Math.max(6, keyboardInset - insets.bottom)
                                    : Math.max(6, insets.bottom)
                                : Math.max(4, insets.bottom),
                    }}
                >
                    <View className="flex-row items-center pb-1.5 pt-1">
                        <View className="flex-1 flex-row items-center px-1">
                            {REACTIONS.map((reaction, index) => (
                                <Pressable
                                    key={`${reaction.label}-${index}`}
                                    onPress={() => {
                                        void handleSendReaction(reaction.emoji);
                                    }}
                                    className="h-11 w-11 items-center justify-center rounded-full border"
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor: colors.backgroundAlt,
                                        marginRight: index === REACTIONS.length - 1 ? 0 : 6,
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Send ${reaction.label} reaction`}
                                    accessibilityHint="Sends a reaction to the room chat"
                                    hitSlop={6}
                                >
                                    <AppText className="text-sm" color={colors.textPrimary}>
                                        {reaction.emoji}
                                    </AppText>
                                </Pressable>
                            ))}
                        </View>
                        <AppText className="ml-1 text-[10px]" color={colors.textSecondary}>
                            {messageText.length}/500
                        </AppText>
                    </View>

                    <View
                        className="mt-1 flex-row items-center rounded-full border pl-2 pr-2 py-1"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    >
                        <View className="mr-1 flex-1 px-2">
                            <TextInput
                                value={messageText}
                                onChangeText={setMessageText}
                                placeholder="Write to the room..."
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                maxLength={500}
                                style={{ color: colors.textPrimary, minHeight: 34, maxHeight: 96, paddingVertical: 4 }}
                                accessibilityLabel="Room message input"
                                returnKeyType="send"
                                onSubmitEditing={() => {
                                    void handleSendMessage();
                                }}
                            />
                        </View>
                        <Pressable
                            onPress={() => {
                                void handleSendMessage();
                            }}
                            className="h-12 w-12 items-center justify-center rounded-full"
                            style={{ backgroundColor: messageText.trim() ? colors.accent : colors.border }}
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                            accessibilityState={{ disabled: !messageText.trim() }}
                            disabled={!messageText.trim()}
                        >
                            <Ionicons name="send" size={17} color={colors.background} />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {showHeaderMenu ? (
                <View
                    pointerEvents="box-none"
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    accessible
                    accessibilityLabel="Room options menu"
                >
                    <Pressable
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        onPress={() => setShowHeaderMenu(false)}
                        accessibilityRole="button"
                        accessibilityLabel="Close room options menu"
                    />
                    <View
                        style={{
                            position: 'absolute',
                            top: 54,
                            right: 10,
                            minWidth: 190,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundAlt,
                            padding: 8,
                            shadowColor: '#000000',
                            shadowOpacity: 0.16,
                            shadowRadius: 10,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 8,
                        }}
                    >
                        {isCreator ? (
                            <Pressable
                                onPress={() => {
                                    setShowHeaderMenu(false);
                                    router.push(`/rooms/manage/${room.id}`);
                                }}
                                className="rounded-lg px-3 py-3"
                                accessibilityRole="button"
                                accessibilityLabel="Manage group"
                                accessibilityHint="Opens room management settings"
                            >
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                    Manage Group
                                </AppText>
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={() => {
                                    void handleLeaveGroup();
                                }}
                                className="rounded-lg px-3 py-3"
                                accessibilityRole="button"
                                accessibilityLabel="Leave group"
                                accessibilityHint="Leaves this room and returns to rooms list"
                            >
                                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                    Leave Group
                                </AppText>
                            </Pressable>
                        )}

                        {isCreator ? (
                            <Pressable
                                onPress={() => {
                                    void handleDeleteGroup();
                                }}
                                className="mt-1 rounded-lg px-3 py-3"
                                accessibilityRole="button"
                                accessibilityLabel="Delete group"
                                accessibilityHint="Permanently deletes this room"
                            >
                                <AppText className="text-sm font-semibold" color={colors.error}>
                                    Delete Group
                                </AppText>
                            </Pressable>
                        ) : null}
                    </View>
                </View>
            ) : null}

            {floatingReaction ? (
                <View pointerEvents="none" style={{ position: 'absolute', right: 28, bottom: 180 }}>
                    <AppText className="text-3xl" color={colors.textPrimary}>
                        {floatingReaction}
                    </AppText>
                </View>
            ) : null}

            <AppModal visible={showMembersModal} onClose={() => setShowMembersModal(false)} title="Room Members">
                <View style={{ maxHeight: 420 }}>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const canModerate = isCreator && item.role !== 'creator';
                            return (
                                <View
                                    className="mb-2 rounded-xl border px-3 py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1 pr-2">
                                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                                {item.displayName}
                                            </AppText>
                                            <AppText className="text-xs" color={colors.textSecondary}>
                                                @{item.username} | {item.isOnline ? 'Online' : 'Offline'}
                                                {item.role === 'creator' ? ' | Creator' : ''}
                                            </AppText>
                                        </View>
                                        {item.isMuted ? (
                                            <View className="rounded-full px-2 py-1" style={{ backgroundColor: `${colors.warning}20` }}>
                                                <AppText className="text-[11px] font-semibold" color={colors.warning}>
                                                    Muted
                                                </AppText>
                                            </View>
                                        ) : null}
                                    </View>

                                    {canModerate ? (
                                        <View className="mt-2 flex-row">
                                            <Pressable
                                                onPress={() => {
                                                    void handleMuteMember(item, !item.isMuted);
                                                }}
                                                className="mr-2 rounded-lg border px-2 py-2"
                                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${item.isMuted ? 'Unmute' : 'Mute'} ${item.displayName}`}
                                            >
                                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                                    {item.isMuted ? 'Unmute' : 'Mute'}
                                                </AppText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => {
                                                    void handleKickMember(item);
                                                }}
                                                className="rounded-lg border px-2 py-2"
                                                style={{ borderColor: `${colors.error}44`, backgroundColor: `${colors.error}12` }}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Kick ${item.displayName}`}
                                            >
                                                <AppText className="text-xs font-semibold" color={colors.error}>
                                                    Kick
                                                </AppText>
                                            </Pressable>
                                        </View>
                                    ) : null}
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </AppModal>

            <AppModal visible={showTipModal} onClose={() => setShowTipModal(false)} title="Send Tip">
                <View>
                    <View className="rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={tipAmount}
                            onChangeText={setTipAmount}
                            keyboardType="decimal-pad"
                            placeholder="Tip amount in GHS"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Tip amount"
                        />
                    </View>

                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={tipMessage}
                            onChangeText={setTipMessage}
                            placeholder="Optional tip message"
                            placeholderTextColor={colors.textSecondary}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Tip message"
                        />
                    </View>

                    <AppButton
                        title="Send Tip"
                        loading={submittingTip}
                        onClick={() => {
                            void handleSendTip();
                        }}
                        style={{ marginTop: 12 }}
                    />
                </View>
            </AppModal>

        </Screen>
    );
}
