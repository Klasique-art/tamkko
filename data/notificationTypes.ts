export type AppNotificationType =
    | 'tip_received'
    | 'new_follower'
    | 'room_invite'
    | 'withdrawal_status'
    | 'system_announcement';

export const NOTIFICATION_TYPES: AppNotificationType[] = [
    'tip_received',
    'new_follower',
    'room_invite',
    'withdrawal_status',
    'system_announcement',
];
