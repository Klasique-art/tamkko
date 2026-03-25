export type NotificationPreferenceToggle = {
    pushEnabled: boolean;
    inAppEnabled: boolean;
    emailEnabled: boolean;
};

export type NotificationItem = {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    deepLink?: string;
};
