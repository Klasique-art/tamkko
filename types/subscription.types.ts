export type CreatorSubscription = {
    id: string;
    creatorId: string;
    creatorUsername: string;
    status: 'pending' | 'active' | 'cancelled' | 'failed';
    amount: number;
    currency: string;
    startedAt: string;
    renewsAt?: string;
};
