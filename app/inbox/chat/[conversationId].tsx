import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Keyboard,
    KeyboardEvent,
    Platform,
    Pressable,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useInboxStore } from '@/lib/stores/inboxStore';
import { DirectMessage } from '@/types/inbox.types';

const formatChatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

export default function InboxChatScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
    const [draft, setDraft] = React.useState('');
    const [keyboardHeight, setKeyboardHeight] = React.useState(0);

    const safeConversationId = decodeURIComponent(conversationId ?? '');
    const conversations = useInboxStore((state) => state.conversations);
    const messagesByConversation = useInboxStore((state) => state.messagesByConversation);
    const sendMessage = useInboxStore((state) => state.sendMessage);
    const markConversationRead = useInboxStore((state) => state.markConversationRead);
    const setActiveConversation = useInboxStore((state) => state.setActiveConversation);

    const conversation = conversations.find((item) => item.id === safeConversationId) ?? null;
    const messages = messagesByConversation[safeConversationId] ?? [];

    useFocusEffect(
        React.useCallback(() => {
            if (!safeConversationId) return undefined;
            setActiveConversation(safeConversationId);
            markConversationRead(safeConversationId);
            return () => {
                setActiveConversation(null);
            };
        }, [markConversationRead, safeConversationId, setActiveConversation])
    );

    React.useEffect(() => {
        const onShow = (event: KeyboardEvent) => {
            const rawHeight = event.endCoordinates?.height ?? 0;
            const adjusted = Math.max(0, rawHeight - insets.bottom);
            setKeyboardHeight(adjusted);
        };
        const onHide = () => {
            setKeyboardHeight(0);
        };

        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [insets.bottom]);

    const handleSend = React.useCallback(() => {
        if (!safeConversationId || !draft.trim()) return;
        sendMessage(safeConversationId, draft);
        setDraft('');
        Keyboard.dismiss();
    }, [draft, safeConversationId, sendMessage]);

    const renderMessage = React.useCallback(
        ({ item }: { item: DirectMessage }) => {
            const isMine = item.sender === 'me';
            return (
                <View className={`mb-3 ${isMine ? 'items-end' : 'items-start'}`}>
                    <View
                        className="max-w-[82%] rounded-3xl px-4 py-2.5"
                        style={{
                            backgroundColor: isMine ? colors.textPrimary : colors.backgroundAlt,
                            borderWidth: isMine ? 0 : 1,
                            borderColor: colors.border,
                        }}
                    >
                        <AppText className="text-sm leading-5" color={isMine ? colors.background : colors.textPrimary}>
                            {item.text}
                        </AppText>
                        <AppText className="mt-1 text-[10px]" color={isMine ? 'rgba(255,255,255,0.8)' : colors.textSecondary}>
                            {formatChatTime(item.createdAt)}
                        </AppText>
                    </View>
                </View>
            );
        },
        [colors.background, colors.backgroundAlt, colors.border, colors.textPrimary, colors.textSecondary]
    );

    if (!conversation) {
        return (
            <Screen title="Chat">
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-sm" color={colors.textSecondary}>
                        Conversation not found.
                    </AppText>
                </View>
            </Screen>
        );
    }

    return (
        <Screen title={conversation.creatorHandle}>
            <View className="flex-1">
                <FlashList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        markConversationRead(safeConversationId);
                    }}
                    ListEmptyComponent={
                        <View className="items-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm" color={colors.textSecondary}>
                                Send a message to start this conversation.
                            </AppText>
                        </View>
                    }
                />

                <View
                    className="border-t px-3 pt-2"
                    style={{
                        borderColor: colors.border,
                        paddingBottom: Math.max(insets.bottom, 8) + (Platform.OS === 'android' ? keyboardHeight : 0),
                    }}
                >
                    <View className="flex-row items-end rounded-3xl border px-3 py-2" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder={`Message ${conversation.creatorDisplayName}`}
                            placeholderTextColor={colors.textSecondary}
                            style={{
                                flex: 1,
                                color: colors.textPrimary,
                                minHeight: 36,
                                maxHeight: 110,
                                fontSize: 15,
                            }}
                            multiline
                            accessibilityLabel="Message input"
                            returnKeyType="send"
                            onSubmitEditing={() => {
                                if (Platform.OS !== 'ios') handleSend();
                            }}
                        />

                        <Pressable
                            onPress={handleSend}
                            className="ml-2 h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: draft.trim() ? colors.accent : colors.border }}
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                            accessibilityState={{ disabled: !draft.trim() }}
                            disabled={!draft.trim()}
                        >
                            <Ionicons name="send" size={17} color={colors.background} />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Screen>
    );
}
