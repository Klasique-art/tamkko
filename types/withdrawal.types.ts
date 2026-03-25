export type WithdrawalItem = {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
    createdAt: string;
    reviewedAt?: string;
};
