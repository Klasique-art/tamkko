export type NotificationType =
    | 'payment_success'
    | 'payment_failed'
    | 'payment_reminder'
    | 'draw_reminder'
    | 'draw_results'
    | 'win'
    | 'payout_update'
    | 'kyc_update';

export type NotificationStatusFilter = 'all' | 'read' | 'unread';

export interface AppNotification {
    notification_id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    data?: Record<string, string>;
}

export interface NotificationsResponse {
    success: boolean;
    data: {
        notifications: AppNotification[];
        unread_count: number;
        pagination: {
            current_page: number;
            total_pages: number;
            total_items: number;
            items_per_page: number;
        };
    };
}

export const mockNotificationsResponse: NotificationsResponse = {
    success: true,
    data: {
        notifications: [
            {
                notification_id: 'notif_123',
                type: 'payment_success',
                title: 'Payment Successful',
                message: 'Your monthly payment of $20 has been processed.',
                is_read: false,
                created_at: '2026-02-12T10:32:00Z',
                data: { payment_id: 'pay_monthly_abc123' },
            },
            {
                notification_id: 'notif_124',
                type: 'draw_reminder',
                title: 'Draw Happening Soon',
                message: 'This month draw closes in 3 days.',
                is_read: false,
                created_at: '2026-02-11T09:00:00Z',
                data: { draw_id: 'draw_2026_02' },
            },
            {
                notification_id: 'notif_125',
                type: 'payout_update',
                title: 'Payout Status Updated',
                message: 'Your payout request is now processing.',
                is_read: true,
                created_at: '2026-02-08T16:40:00Z',
                data: { payout_id: 'payout_5521' },
            },
            {
                notification_id: 'notif_126',
                type: 'kyc_update',
                title: 'KYC Verification Approved',
                message: 'Your identity verification has been approved.',
                is_read: true,
                created_at: '2026-02-03T12:10:00Z',
                data: { kyc_id: 'kyc_9988' },
            },
            {
                notification_id: 'notif_127',
                type: 'payment_failed',
                title: 'Payment Failed',
                message: 'Your last payment attempt failed. Please retry.',
                is_read: false,
                created_at: '2026-02-01T08:12:00Z',
                data: { payment_id: 'pay_monthly_xyz900' },
            },
        ],
        unread_count: 3,
        pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: 5,
            items_per_page: 20,
        },
    },
};
