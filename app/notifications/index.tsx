import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config';
import { useToast } from '@/context/ToastContext';
import {
    AppNotification,
    NotificationStatusFilter,
    mockNotificationsResponse
} from '@/data/notifications.dummy';

const NotificationsScreen = () => {
    const colors = useColors();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [filter, setFilter] = useState<NotificationStatusFilter>('all');
    const [notifications, setNotifications] = useState<AppNotification[]>(
        mockNotificationsResponse.data.notifications
    );

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.is_read).length,
        [notifications]
    );

    const filteredNotifications = useMemo(() => {
        if (filter === 'read') return notifications.filter((item) => item.is_read);
        if (filter === 'unread') return notifications.filter((item) => !item.is_read);
        return notifications;
    }, [notifications, filter]);

    const markAsRead = (notificationId: string) => {
        setNotifications((prev) =>
            prev.map((item) =>
                item.notification_id === notificationId ? { ...item, is_read: true } : item
            )
        );
        showToast('Notification marked as read', { variant: 'success' });
    };

    const markAllAsRead = () => {
        if (unreadCount === 0) {
            showToast('All notifications are already read', { variant: 'info' });
            return;
        }

        setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
        showToast(`Marked ${unreadCount} notification(s) as read`, { variant: 'success' });
    };

    const deleteNotification = (notificationId: string) => {
        setNotifications((prev) => prev.filter((item) => item.notification_id !== notificationId));
        showToast('Notification deleted', { variant: 'info' });
    };

    const getNotificationMeta = (type: AppNotification['type']) => {
        switch (type) {
            case 'payment_success':
                return { icon: 'checkmark-circle' as const, color: colors.success };
            case 'payment_failed':
                return { icon: 'alert-circle' as const, color: colors.error };
            case 'payment_reminder':
            case 'draw_reminder':
                return { icon: 'time' as const, color: colors.warning };
            case 'draw_results':
            case 'win':
                return { icon: 'trophy' as const, color: colors.accent };
            case 'payout_update':
                return { icon: 'cash' as const, color: colors.info };
            case 'kyc_update':
                return { icon: 'shield-checkmark' as const, color: colors.primary };
            default:
                return { icon: 'notifications' as const, color: colors.textSecondary };
        }
    };

    const formatTimestamp = (isoDate: string) =>
        new Date(isoDate).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

    return (
        <Screen>
            <Nav title="Notifications" />
            <ScrollView className="pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
                <View className="mb-4 flex-row items-center justify-between px-1">
                    <View>
                        <AppText className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                            Inbox
                        </AppText>
                        <AppText className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                            {unreadCount} unread
                        </AppText>
                    </View>
                    <Pressable
                        onPress={markAllAsRead}
                        className="rounded-lg px-3 py-2"
                        style={{ backgroundColor: `${colors.accent}20` }}
                        accessibilityRole="button"
                        accessibilityLabel={t('Mark all notifications as read')}
                    >
                        <AppText className="text-xs font-bold" style={{ color: colors.accent }}>
                            Mark All Read
                        </AppText>
                    </Pressable>
                </View>

                <View className="mb-4 flex-row gap-2 px-1">
                    {(['all', 'unread', 'read'] as NotificationStatusFilter[]).map((item) => {
                        const isActive = filter === item;
                        return (
                            <Pressable
                                key={item}
                                onPress={() => setFilter(item)}
                                className="rounded-full px-4 py-2"
                                style={{
                                    backgroundColor: isActive ? colors.accent : colors.backgroundAlt,
                                    borderWidth: 1,
                                    borderColor: isActive ? colors.accent : colors.border,
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={t('Show {{status}} notifications', { status: t(item) })}
                            >
                                <AppText
                                    className="text-xs font-bold uppercase"
                                    style={{ color: isActive ? colors.white : colors.textSecondary }}
                                >
                                    {item}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border }}>
                    {filteredNotifications.length === 0 ? (
                        <View className="items-center p-6" style={{ backgroundColor: colors.backgroundAlt }}>
                            <Ionicons name="notifications-off-outline" size={26} color={colors.textSecondary} />
                            <AppText className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                                No notifications in this filter.
                            </AppText>
                        </View>
                    ) : (
                        filteredNotifications.map((item, index) => {
                            const meta = getNotificationMeta(item.type);
                            return (
                                <View
                                    key={item.notification_id}
                                    className={`p-4 ${index !== filteredNotifications.length - 1 ? 'border-b' : ''}`}
                                    style={{
                                        backgroundColor: item.is_read ? colors.background : colors.backgroundAlt,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <View className="flex-row items-start">
                                        <View
                                            className="mr-3 mt-1 w-9 h-9 items-center justify-center rounded-full"
                                            style={{ backgroundColor: `${meta.color}20` }}
                                        >
                                            <Ionicons name={meta.icon} size={18} color={meta.color} />
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row items-center justify-between">
                                                <AppText className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                                                    {item.title}
                                                </AppText>
                                                {!item.is_read && (
                                                    <View
                                                        className="rounded-full px-2 py-1"
                                                        style={{ backgroundColor: `${colors.accent}20` }}
                                                    >
                                                        <AppText className="text-[10px] font-bold" style={{ color: colors.accent }}>
                                                            UNREAD
                                                        </AppText>
                                                    </View>
                                                )}
                                            </View>

                                            <AppText className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                                                {item.message}
                                            </AppText>
                                            <AppText className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                                                {formatTimestamp(item.created_at)}
                                            </AppText>

                                            <View className="mt-3 flex-row gap-4">
                                                {!item.is_read && (
                                                    <Pressable
                                                        onPress={() => markAsRead(item.notification_id)}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={t('Mark notification as read')}
                                                    >
                                                        <AppText className="text-xs font-bold" style={{ color: colors.accent }}>
                                                            Mark as Read
                                                        </AppText>
                                                    </Pressable>
                                                )}
                                                <Pressable
                                                    onPress={() => deleteNotification(item.notification_id)}
                                                    accessibilityRole="button"
                                                    accessibilityLabel={t('Delete notification')}
                                                >
                                                    <AppText className="text-xs font-bold" style={{ color: colors.error }}>
                                                        Delete
                                                    </AppText>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <View className="mt-3 px-1">
                    <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                        Page 1 of 1 • API limit: {mockNotificationsResponse.data.pagination.items_per_page}
                    </AppText>
                </View>
            </ScrollView>
        </Screen>
    );
};

export default NotificationsScreen;
