export type WalletSummary = {
    currency: string;
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
};

export type WalletTransaction = {
    id: string;
    type: 'tip' | 'subscription' | 'withdrawal' | 'referral_reward';
    direction?: 'credit' | 'debit';
    title?: string;
    subtitle?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';
    createdAt: string;
};

export type WithdrawalRequest = {
    amount: number;
    phoneNumber: string;
    network: 'mtn' | 'vodafone' | 'airteltigo';
};

export type MomoAccount = {
    network: 'mtn' | 'vodafone' | 'airteltigo';
    phoneNumber: string;
    accountName: string;
    isVerified: boolean;
    updatedAt: string;
};

export type SentTipItem = {
    tipId: string;
    videoId: string;
    creatorUsername: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    reference: string;
};

export type WalletSubscriptionItem = {
    id: string;
    creatorId: string;
    creatorUsername: string;
    creatorDisplayName: string;
    amount: number;
    currency: string;
    status: 'pending' | 'active' | 'failed' | 'cancelled';
    startedAt: string;
    renewsAt: string;
    cancelAtPeriodEnd?: boolean;
};

export type WalletWithdrawalItem = {
    id: string;
    amount: number;
    currency: string;
    network: 'mtn' | 'vodafone' | 'airteltigo';
    phoneNumber: string;
    status: 'otp_required' | 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
    createdAt: string;
    otpVerifiedAt?: string;
    failureReason?: string;
};

export type EarningsByVideoItem = {
    videoId: string;
    title: string;
    tipsEarnings: number;
    subscriptionsEarnings: number;
    totalEarnings: number;
    views: number;
};
