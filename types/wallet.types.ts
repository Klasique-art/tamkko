export type WalletSummary = {
    currency: string;
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
};

export type WalletTransaction = {
    id: string;
    type: 'tip' | 'subscription' | 'withdrawal' | 'referral_reward';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
};

export type WithdrawalRequest = {
    amount: number;
    phoneNumber: string;
    network: 'mtn' | 'vodafone' | 'airteltigo';
};
