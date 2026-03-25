import { WalletSummary, WalletTransaction } from '@/types/wallet.types';

export const mockWalletSummary: WalletSummary = {
    currency: 'GHS',
    availableBalance: 560.4,
    pendingBalance: 42,
    lifetimeEarnings: 8320.75,
};

export const mockWalletTransactions: WalletTransaction[] = [
    {
        id: 'txn_001',
        type: 'tip',
        amount: 25,
        currency: 'GHS',
        status: 'completed',
        createdAt: '2026-03-24T11:22:00Z',
    },
    {
        id: 'txn_002',
        type: 'withdrawal',
        amount: 150,
        currency: 'GHS',
        status: 'pending',
        createdAt: '2026-03-24T08:00:00Z',
    },
    {
        id: 'txn_003',
        type: 'referral_reward',
        amount: 12.5,
        currency: 'GHS',
        status: 'completed',
        createdAt: '2026-03-23T19:00:00Z',
    },
];
