import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { mockNotifications } from '@/data/mock';
import { NotificationItem, NotificationPreferenceToggle } from '@/types/notification.types';

type NotificationCenterState = {
    notifications: NotificationItem[];
    preferences: NotificationPreferenceToggle;
};

const STORAGE_KEY = '@tamkko_notification_center_v1';

const defaultState: NotificationCenterState = {
    notifications: [...mockNotifications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    preferences: {
        pushEnabled: true,
        inAppEnabled: true,
        emailEnabled: false,
    },
};

let memoryState: NotificationCenterState | null = null;

const readState = async (): Promise<NotificationCenterState> => {
    if (memoryState) return memoryState;
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            memoryState = JSON.parse(raw) as NotificationCenterState;
            return memoryState;
        }
    } catch {}
    memoryState = defaultState;
    return memoryState;
};

const saveState = async (state: NotificationCenterState) => {
    memoryState = state;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const toNotificationItem = (item: NotificationItem): NotificationItem => ({ ...item });

const nowIso = () => new Date().toISOString();

export const mockNotificationCenterService = {
    async list() {
        const state = await readState();
        return state.notifications.map(toNotificationItem);
    },

    async getPreferences() {
        const state = await readState();
        return { ...state.preferences };
    },

    async setPreferences(patch: Partial<NotificationPreferenceToggle>) {
        const state = await readState();
        const next: NotificationCenterState = {
            ...state,
            preferences: { ...state.preferences, ...patch },
        };
        await saveState(next);
        return { ...next.preferences };
    },

    async getUnreadCount() {
        const state = await readState();
        return state.notifications.filter((item) => !item.isRead).length;
    },

    async markRead(id: string) {
        const state = await readState();
        const next: NotificationCenterState = {
            ...state,
            notifications: state.notifications.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        };
        await saveState(next);
        return next.notifications.map(toNotificationItem);
    },

    async markAllRead() {
        const state = await readState();
        const next: NotificationCenterState = {
            ...state,
            notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
        };
        await saveState(next);
        return next.notifications.map(toNotificationItem);
    },

    async remove(id: string) {
        const state = await readState();
        const next: NotificationCenterState = {
            ...state,
            notifications: state.notifications.filter((item) => item.id !== id),
        };
        await saveState(next);
        return next.notifications.map(toNotificationItem);
    },

    async add(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) {
        const state = await readState();
        const nextItem: NotificationItem = {
            id: `ntf_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            title: item.title,
            body: item.body,
            deepLink: item.deepLink,
            isRead: false,
            createdAt: nowIso(),
        };
        const next: NotificationCenterState = {
            ...state,
            notifications: [nextItem, ...state.notifications],
        };
        await saveState(next);
        return toNotificationItem(nextItem);
    },

    async requestPushPermission() {
        const current = await Notifications.getPermissionsAsync();
        if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
            return current;
        }
        return Notifications.requestPermissionsAsync();
    },

    async getPushPermissionStatus() {
        return Notifications.getPermissionsAsync();
    },
};
