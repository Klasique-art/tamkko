import client from '@/lib/client';
import { ApiSuccessResponse } from '@/types/api.types';
import { NotificationItem, NotificationPreferenceToggle } from '@/types/notification.types';

export const notificationService = {
    async registerPushToken(token: string) {
        await client.post('/notifications/token', { token });
    },

    async deregisterPushToken(token: string) {
        await client.delete('/notifications/token', { data: { token } });
    },

    async getNotifications(): Promise<NotificationItem[]> {
        const response = await client.get<ApiSuccessResponse<NotificationItem[]>>('/notifications');
        return response.data.data;
    },

    async markAsRead(notificationId: string) {
        await client.patch(`/notifications/${notificationId}/read`);
    },

    async markAllAsRead() {
        await client.post('/notifications/read-all');
    },

    async getUnreadCount(): Promise<number> {
        const response = await client.get<ApiSuccessResponse<{ unreadCount: number }>>('/notifications/unread-count');
        return response.data.data.unreadCount;
    },

    async getPreferences(): Promise<NotificationPreferenceToggle> {
        const response = await client.get<ApiSuccessResponse<NotificationPreferenceToggle>>('/notifications/preferences');
        return response.data.data;
    },

    async updatePreferences(payload: Partial<NotificationPreferenceToggle>) {
        const response = await client.patch<ApiSuccessResponse<NotificationPreferenceToggle>>('/notifications/preferences', payload);
        return response.data.data;
    },
};
