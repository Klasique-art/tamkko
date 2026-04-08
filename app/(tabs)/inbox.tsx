import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { mockNotifications } from '@/data/mock';
import { useInboxStore } from '@/lib/stores/inboxStore';

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

export default function InboxTab() {
    const colors = useColors();
    const conversations = useInboxStore((state) => state.conversations);
    const [activeTab, setActiveTab] = React.useState<'messages' | 'activity'>('messages');
    const totalUnread = conversations.reduce((count, item) => count + item.unreadCount, 0);

    return (
        <Screen className="pt-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <AppText className="text-2xl font-bold" color={colors.textPrimary}>Inbox</AppText>
                <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                    Direct messages and activity updates in one place.
                </AppText>

                <View
                    className="mt-4 flex-row rounded-xl border p-1"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <Pressable
                        onPress={() => setActiveTab('messages')}
                        className="flex-1 rounded-lg py-2"
                        style={{ backgroundColor: activeTab === 'messages' ? colors.background : 'transparent' }}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTab === 'messages' }}
                        accessibilityLabel="Messages tab"
                    >
                        <View className="flex-row items-center justify-center">
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                Messages
                            </AppText>
                            {totalUnread > 0 ? (
                                <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: colors.accent }}>
                                    <AppText className="text-[10px] font-bold" color={colors.white}>
                                        {totalUnread}
                                    </AppText>
                                </View>
                            ) : null}
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('activity')}
                        className="ml-1 flex-1 rounded-lg py-2"
                        style={{ backgroundColor: activeTab === 'activity' ? colors.background : 'transparent' }}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTab === 'activity' }}
                        accessibilityLabel="Activity tab"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Activity
                        </AppText>
                    </Pressable>
                </View>

                <View className="mt-4 gap-3">
                    {activeTab === 'messages'
                        ? conversations.length > 0
                            ? conversations.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => router.push(`/inbox/chat/${encodeURIComponent(item.id)}` as Href)}
                                    className="rounded-2xl border p-4"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Open conversation with ${item.creatorHandle}`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                                {item.creatorHandle}
                                            </AppText>
                                            {item.isVerified ? (
                                                <Ionicons name="checkmark-circle" size={14} color={colors.info} style={{ marginLeft: 5 }} />
                                            ) : null}
                                        </View>
                                        <View className="flex-row items-center">
                                            <AppText className="text-[11px]" color={colors.textSecondary}>
                                                {formatTime(item.lastMessageAt)}
                                            </AppText>
                                            {item.unreadCount > 0 ? (
                                                <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: colors.accent }}>
                                                    <AppText className="text-[10px] font-bold" color={colors.white}>
                                                        {item.unreadCount}
                                                    </AppText>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary} numberOfLines={1}>
                                        {item.lastMessage}
                                    </AppText>
                                </Pressable>
                            ))
                            : (
                                <View
                                    className="items-center rounded-2xl border px-4 py-8"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                >
                                    <View
                                        className="h-12 w-12 items-center justify-center rounded-full"
                                        style={{ backgroundColor: colors.background }}
                                    >
                                        <Ionicons name="chatbubbles-outline" size={24} color={colors.textSecondary} />
                                    </View>
                                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>
                                        No Conversations Yet
                                    </AppText>
                                    <AppText className="mt-1 text-center text-sm" color={colors.textSecondary}>
                                        Tap Message on any creator profile to start chatting.
                                    </AppText>
                                </View>
                            )
                        : mockNotifications.map((item) => (
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
