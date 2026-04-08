import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { AppState } from 'react-native';

import { useToast } from '@/context/ToastContext';
import { mockNotificationCenterService } from '@/lib/services/mockNotificationCenterService';
import { NotificationItem, NotificationPreferenceToggle } from '@/types/notification.types';

type NotificationCenterContextType = {
    notifications: NotificationItem[];
    unreadCount: number;
    preferences: NotificationPreferenceToggle;
    pushPermissionLabel: string;
    isLoading: boolean;
    refresh: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    updatePreferences: (patch: Partial<NotificationPreferenceToggle>) => Promise<void>;
    requestPushOnboardingPermission: () => Promise<void>;
};

const NotificationCenterContext = React.createContext<NotificationCenterContextType | undefined>(undefined);

const defaultPreferences: NotificationPreferenceToggle = {
    pushEnabled: true,
    inAppEnabled: true,
    emailEnabled: false,
};

const permissionToLabel = (granted: boolean, status: string) => (granted ? 'Allowed' : status === 'undetermined' ? 'Not asked' : 'Denied');

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
    const { showToast } = useToast();
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [preferences, setPreferences] = React.useState<NotificationPreferenceToggle>(defaultPreferences);
    const [isLoading, setIsLoading] = React.useState(true);
    const [pushPermissionLabel, setPushPermissionLabel] = React.useState('Unknown');

    const syncAll = React.useCallback(async () => {
        const [items, nextPreferences, unread, pushPermissions] = await Promise.all([
            mockNotificationCenterService.list(),
            mockNotificationCenterService.getPreferences(),
            mockNotificationCenterService.getUnreadCount(),
            mockNotificationCenterService.getPushPermissionStatus(),
        ]);
        setNotifications(items);
        setPreferences(nextPreferences);
        setUnreadCount(unread);
        setPushPermissionLabel(permissionToLabel(Boolean(pushPermissions.granted), String(pushPermissions.status)));
    }, []);

    const refresh = React.useCallback(async () => {
        await syncAll();
    }, [syncAll]);

    React.useEffect(() => {
        const load = async () => {
            try {
                await syncAll();
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [syncAll]);

    React.useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                void syncAll();
            }
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data as { deepLink?: string; notificationId?: string } | undefined;
            if (data?.notificationId) {
                void mockNotificationCenterService.markRead(data.notificationId).then(async () => {
                    setNotifications(await mockNotificationCenterService.list());
                    setUnreadCount(await mockNotificationCenterService.getUnreadCount());
                });
            }
            if (data?.deepLink && typeof data.deepLink === 'string') {
                router.push(data.deepLink as never);
            }
        });

        return () => {
            appStateSubscription.remove();
            responseSubscription.remove();
        };
    }, [syncAll]);

    const markAsRead = React.useCallback(async (id: string) => {
        const next = await mockNotificationCenterService.markRead(id);
        setNotifications(next);
        setUnreadCount(await mockNotificationCenterService.getUnreadCount());
    }, []);

    const markAllRead = React.useCallback(async () => {
        const next = await mockNotificationCenterService.markAllRead();
        setNotifications(next);
        setUnreadCount(0);
        showToast('All notifications marked as read.', { variant: 'success', duration: 1400 });
    }, [showToast]);

    const deleteNotification = React.useCallback(async (id: string) => {
        const next = await mockNotificationCenterService.remove(id);
        setNotifications(next);
        setUnreadCount(await mockNotificationCenterService.getUnreadCount());
    }, []);

    const updatePreferences = React.useCallback(async (patch: Partial<NotificationPreferenceToggle>) => {
        const next = await mockNotificationCenterService.setPreferences(patch);
        setPreferences(next);
    }, []);

    const requestPushOnboardingPermission = React.useCallback(async () => {
        const result = await mockNotificationCenterService.requestPushPermission();
        const allowed = Boolean(result.granted);
        setPushPermissionLabel(permissionToLabel(allowed, String(result.status)));
        await updatePreferences({ pushEnabled: allowed });
        showToast(
            allowed ? 'Push notifications enabled.' : 'Push permission not granted.',
            { variant: allowed ? 'success' : 'warning', duration: 1800 }
        );
    }, [showToast, updatePreferences]);

    const value = React.useMemo(
        () => ({
            notifications,
            unreadCount,
            preferences,
            pushPermissionLabel,
            isLoading,
            refresh,
            markAsRead,
            markAllRead,
            deleteNotification,
            updatePreferences,
            requestPushOnboardingPermission,
        }),
        [
            notifications,
            unreadCount,
            preferences,
            pushPermissionLabel,
            isLoading,
            refresh,
            markAsRead,
            markAllRead,
            deleteNotification,
            updatePreferences,
            requestPushOnboardingPermission,
        ]
    );

    return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
    const context = React.useContext(NotificationCenterContext);
    if (!context) throw new Error('useNotificationCenter must be used within NotificationCenterProvider');
    return context;
}
