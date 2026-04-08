import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useNotificationCenter } from '@/context/NotificationCenterContext';
import { mockNotificationCenterService } from '@/lib/services/mockNotificationCenterService';
import { NotificationItem } from '@/types/notification.types';

type Filter = 'all' | 'unread' | 'read';

const FILTERS: Filter[] = ['all', 'unread', 'read'];

const formatTimeAgo = (isoDate: string) => {
    const deltaMs = Date.now() - +new Date(isoDate);
    const minutes = Math.max(1, Math.floor(deltaMs / (1000 * 60)));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export default function NotificationsScreen() {
    const colors = useColors();
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllRead,
        deleteNotification,
        refresh,
    } = useNotificationCenter();

    const [activeFilter, setActiveFilter] = React.useState<Filter>('all');
    const [deleteTarget, setDeleteTarget] = React.useState<NotificationItem | null>(null);
    const [addingMock, setAddingMock] = React.useState(false);

    const filteredItems = React.useMemo(() => {
        if (activeFilter === 'unread') return notifications.filter((item) => !item.isRead);
        if (activeFilter === 'read') return notifications.filter((item) => item.isRead);
        return notifications;
    }, [activeFilter, notifications]);

    const openNotification = React.useCallback(
        async (item: NotificationItem) => {
            if (!item.isRead) await markAsRead(item.id);
            if (item.deepLink) router.push(item.deepLink as Href);
        },
        [markAsRead]
    );

    const addMockNotification = async () => {
        if (addingMock) return;
        setAddingMock(true);
        await mockNotificationCenterService.add({
            title: 'Simulated Creator Update',
            body: 'A new premium upload is available from a creator you follow.',
            deepLink: '/video/following',
        });
        await refresh();
        setAddingMock(false);
    };

    return (
        <Screen title="Notifications" className="pt-3">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-2">
                            <AppText className="text-lg font-black" color={colors.textPrimary}>Notifications Center</AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                {unreadCount} unread updates.
                            </AppText>
                        </View>
                        <Pressable
                            onPress={() => router.push('/notifications/preferences' as Href)}
                            className="rounded-xl border px-3 py-2"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Open notification preferences"
                        >
                            <Ionicons name="settings-outline" size={16} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    <View className="mt-3 flex-row" accessibilityRole="tablist">
                        {FILTERS.map((filter) => {
                            const selected = activeFilter === filter;
                            return (
                                <Pressable
                                    key={filter}
                                    onPress={() => setActiveFilter(filter)}
                                    className="mr-2 rounded-full border px-3 py-2"
                                    style={{
                                        borderColor: selected ? colors.primary : colors.border,
                                        backgroundColor: selected ? colors.primary : colors.background,
                                    }}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`${filter} notifications`}
                                >
                                    <AppText className="text-xs font-bold" color={selected ? colors.white : colors.textPrimary}>
                                        {filter.toUpperCase()}
                                    </AppText>
                                </Pressable>
                            );
                        })}

                        <Pressable
                            onPress={() => void markAllRead()}
                            className="ml-auto rounded-full border px-3 py-2"
                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                            accessibilityRole="button"
                            accessibilityLabel="Mark all notifications as read"
                        >
                            <AppText className="text-xs font-semibold" color={colors.textPrimary}>Mark All Read</AppText>
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={() => void addMockNotification()}
                        className="mt-3 rounded-xl border py-2.5"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Simulate incoming notification"
                    >
                        <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>
                            {addingMock ? 'Adding...' : 'Simulate Notification'}
                        </AppText>
                    </Pressable>
                </View>

                <View className="mt-4 gap-3">
                    {!isLoading && filteredItems.length === 0 ? (
                        <View className="rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-base font-bold" color={colors.textPrimary}>No notifications</AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                Updates from followers, tips, and rooms will appear here.
                            </AppText>
                        </View>
                    ) : filteredItems.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => void openNotification(item)}
                            className="rounded-2xl border p-4"
                            style={{
                                borderColor: item.isRead ? colors.border : `${colors.accent}66`,
                                backgroundColor: item.isRead ? colors.backgroundAlt : `${colors.accent}14`,
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`${item.title}. ${item.body}`}
                            accessibilityHint="Opens related screen"
                        >
                            <View className="flex-row items-start">
                                <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: item.isRead ? colors.background : `${colors.accent}26` }}>
                                    <Ionicons name={item.isRead ? 'mail-open-outline' : 'mail-unread-outline'} size={16} color={colors.textPrimary} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <AppText className="text-sm font-bold" color={colors.textPrimary}>{item.title}</AppText>
                                        <AppText className="text-[11px]" color={colors.textSecondary}>
                                            {formatTimeAgo(item.createdAt)}
                                        </AppText>
                                    </View>
                                    <AppText className="mt-1 text-xs leading-5" color={colors.textSecondary}>{item.body}</AppText>
                                </View>
                                <Pressable
                                    onPress={(event) => {
                                        event.stopPropagation();
                                        setDeleteTarget(item);
                                    }}
                                    className="ml-2 h-8 w-8 items-center justify-center rounded-full"
                                    style={{ backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Delete notification"
                                >
                                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                                </Pressable>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            <ConfirmModal
                visible={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    void deleteNotification(deleteTarget.id);
                    setDeleteTarget(null);
                }}
                title="Delete Notification"
                description="Remove this notification from your center?"
                confirmText="Delete"
                isDestructive
            />
        </Screen>
    );
}
