import { mockCreatorProfiles } from '@/data/mock/creators';
import { mockVideos } from '@/data/mock/videos';
import { delay } from '@/lib/utils/delay';
import {
    EarningsByVideoItem,
    MomoAccount,
    SentTipItem,
    WalletSubscriptionItem,
    WalletSummary,
    WalletTransaction,
    WalletWithdrawalItem,
    WithdrawalRequest,
} from '@/types/wallet.types';

type OtpChallenge = {
    id: string;
    type: 'momo_update' | 'withdrawal';
    targetId: string;
    expiresAt: string;
    code: string;
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
const OTP_CODE = '123456';

let momoAccountStore: MomoAccount = {
    network: 'mtn',
    phoneNumber: '0240001122',
    accountName: 'Klasique',
    isVerified: true,
    updatedAt: '2026-03-29T10:20:00Z',
};

const subscriptionsStore: WalletSubscriptionItem[] = [
    {
        id: 'sub_ama_001',
        creatorId: 'cr_ama',
        creatorUsername: '@ama.creator',
        creatorDisplayName: 'Ama Creator',
        amount: 15,
        currency: 'GHS',
        status: 'active',
        startedAt: '2026-03-12T12:00:00Z',
        renewsAt: '2026-04-12T12:00:00Z',
        cancelAtPeriodEnd: false,
    },
    {
        id: 'sub_klasique_001',
        creatorId: 'cr_klasique',
        creatorUsername: '@klasique',
        creatorDisplayName: 'Klasique Official',
        amount: 20,
        currency: 'GHS',
        status: 'pending',
        startedAt: '2026-04-07T09:00:00Z',
        renewsAt: '2026-05-07T09:00:00Z',
        cancelAtPeriodEnd: false,
    },
];

const sentTipsStore: SentTipItem[] = [
    {
        tipId: 'tip_001',
        videoId: 'vid_001',
        creatorUsername: '@klasique',
        amount: 20,
        currency: 'GHS',
        status: 'completed',
        createdAt: '2026-04-07T18:21:00Z',
        reference: 'TIP-94822',
    },
    {
        tipId: 'tip_002',
        videoId: 'vid_004',
        creatorUsername: '@ama.creator',
        amount: 10,
        currency: 'GHS',
        status: 'pending',
        createdAt: '2026-04-08T08:10:00Z',
        reference: 'TIP-95011',
    },
    {
        tipId: 'tip_003',
        videoId: 'vid_003',
        creatorUsername: '@campus.star',
        amount: 15,
        currency: 'GHS',
        status: 'processing',
        createdAt: '2026-04-08T07:35:00Z',
        reference: 'TIP-94988',
    },
];

const withdrawalsStore: WalletWithdrawalItem[] = [
    {
        id: 'wd_001',
        amount: 150,
        currency: 'GHS',
        network: 'mtn',
        phoneNumber: '0240001122',
        status: 'processing',
        createdAt: '2026-04-06T11:30:00Z',
        otpVerifiedAt: '2026-04-06T11:32:00Z',
    },
    {
        id: 'wd_002',
        amount: 90,
        currency: 'GHS',
        network: 'mtn',
        phoneNumber: '0240001122',
        status: 'completed',
        createdAt: '2026-03-31T15:22:00Z',
        otpVerifiedAt: '2026-03-31T15:24:00Z',
    },
];

const transactionsStore: WalletTransaction[] = [
    {
        id: 'txn_001',
        type: 'tip',
        title: 'Tip Received',
        subtitle: 'Street Dance Night',
        direction: 'credit',
        amount: 25,
        currency: 'GHS',
        status: 'completed',
        createdAt: '2026-04-07T11:22:00Z',
    },
    {
        id: 'txn_002',
        type: 'withdrawal',
        title: 'Withdrawal',
        subtitle: 'MTN MoMo',
        direction: 'debit',
        amount: 150,
        currency: 'GHS',
        status: 'processing',
        createdAt: '2026-04-06T11:30:00Z',
    },
    {
        id: 'txn_003',
        type: 'subscription',
        title: 'Subscription Earnings',
        subtitle: 'Ama Creator Subscribers',
        direction: 'credit',
        amount: 32,
        currency: 'GHS',
        status: 'completed',
        createdAt: '2026-04-06T08:14:00Z',
    },
    {
        id: 'txn_004',
        type: 'referral_reward',
        title: 'Referral Reward',
        subtitle: '@joelbeats',
        direction: 'credit',
        amount: 12.5,
        currency: 'GHS',
        status: 'completed',
        createdAt: '2026-04-05T16:08:00Z',
    },
];

const earningsByVideoStore: EarningsByVideoItem[] = mockVideos.slice(0, 6).map((video, index) => {
    const tips = Math.round(video.likesCount * (0.012 + index * 0.001));
    const subs = Math.round(video.likesCount * (0.02 + index * 0.0012));
    return {
        videoId: video.id,
        title: video.title,
        tipsEarnings: tips,
        subscriptionsEarnings: subs,
        totalEarnings: tips + subs,
        views: Math.max(2000, Math.round(video.likesCount * 18)),
    };
});

const tipPollCount: Record<string, number> = {};
const withdrawalPollCount: Record<string, number> = {};
const subscriptionPollCount: Record<string, number> = {};
const otpChallengesStore: OtpChallenge[] = [];

const computeSummary = (): WalletSummary => {
    const creditCompleted = transactionsStore
        .filter((item) => item.direction === 'credit' && item.status === 'completed')
        .reduce((sum, item) => sum + item.amount, 0);
    const debitCompleted = transactionsStore
        .filter((item) => item.direction === 'debit' && item.status === 'completed')
        .reduce((sum, item) => sum + item.amount, 0);
    const debitInFlight = transactionsStore
        .filter((item) => item.direction === 'debit' && (item.status === 'pending' || item.status === 'processing'))
        .reduce((sum, item) => sum + item.amount, 0);

    return {
        currency: 'GHS',
        availableBalance: Math.max(0, 560.4 + creditCompleted - debitCompleted - debitInFlight),
        pendingBalance: debitInFlight,
        lifetimeEarnings: 8320.75 + creditCompleted,
    };
};

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const createOtpChallenge = (type: OtpChallenge['type'], targetId: string) => {
    const challenge: OtpChallenge = {
        id: makeId('otp'),
        type,
        targetId,
        code: OTP_CODE,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    otpChallengesStore.unshift(challenge);
    return challenge;
};

const resolveOtpChallenge = (challengeId: string, otp: string, type: OtpChallenge['type']) => {
    const challenge = otpChallengesStore.find((item) => item.id === challengeId && item.type === type);
    if (!challenge) return { ok: false as const, reason: 'Challenge not found.' };
    if (new Date(challenge.expiresAt).getTime() < Date.now()) return { ok: false as const, reason: 'OTP expired.' };
    if (otp.trim() !== challenge.code) return { ok: false as const, reason: 'Invalid OTP.' };
    return { ok: true as const, challenge };
};

export const mockWalletService = {
    async getSummary(): Promise<WalletSummary> {
        await delay(120);
        return computeSummary();
    },

    async getTransactions(): Promise<WalletTransaction[]> {
        await delay(130);
        return copy(transactionsStore).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },

    async getEarningsByVideo(): Promise<EarningsByVideoItem[]> {
        await delay(110);
        return copy(earningsByVideoStore).sort((a, b) => b.totalEarnings - a.totalEarnings);
    },

    async getMomoAccount(): Promise<MomoAccount> {
        await delay(90);
        return copy(momoAccountStore);
    },

    async beginMomoAccountUpdate(input: Omit<MomoAccount, 'updatedAt' | 'isVerified'>) {
        await delay(120);
        const challenge = createOtpChallenge('momo_update', 'momo_account');
        return {
            challengeId: challenge.id,
            maskedPhone: `${input.phoneNumber.slice(0, 3)}****${input.phoneNumber.slice(-2)}`,
        };
    },

    async confirmMomoAccountUpdate(
        challengeId: string,
        otp: string,
        input: Omit<MomoAccount, 'updatedAt' | 'isVerified'>
    ): Promise<{ ok: boolean; message: string; account: MomoAccount }> {
        await delay(180);
        const result = resolveOtpChallenge(challengeId, otp, 'momo_update');
        if (!result.ok) {
            return { ok: false, message: result.reason, account: copy(momoAccountStore) };
        }
        momoAccountStore = {
            ...input,
            isVerified: true,
            updatedAt: nowIso(),
        };
        return { ok: true, message: 'Mobile money account updated.', account: copy(momoAccountStore) };
    },

    async getSentTips(): Promise<SentTipItem[]> {
        await delay(110);
        return copy(sentTipsStore).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },

    async getTipStatus(tipId: string): Promise<SentTipItem | null> {
        await delay(140);
        const tip = sentTipsStore.find((item) => item.tipId === tipId);
        if (!tip) return null;

        tipPollCount[tipId] = (tipPollCount[tipId] ?? 0) + 1;
        const pollCount = tipPollCount[tipId];
        if (tip.status === 'pending' && pollCount >= 2) {
            tip.status = 'processing';
        }
        if (tip.status === 'processing' && pollCount >= 4) {
            tip.status = tip.tipId.endsWith('3') ? 'failed' : 'completed';
        }
        return copy(tip);
    },

    async getSubscriptions(): Promise<WalletSubscriptionItem[]> {
        await delay(120);
        return copy(subscriptionsStore).sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
    },

    async pollSubscriptionStatus(subscriptionId: string): Promise<WalletSubscriptionItem | null> {
        await delay(140);
        const sub = subscriptionsStore.find((item) => item.id === subscriptionId);
        if (!sub) return null;
        subscriptionPollCount[subscriptionId] = (subscriptionPollCount[subscriptionId] ?? 0) + 1;
        if (sub.status === 'pending' && subscriptionPollCount[subscriptionId] >= 3) {
            sub.status = 'active';
        }
        return copy(sub);
    },

    async cancelSubscription(subscriptionId: string): Promise<WalletSubscriptionItem | null> {
        await delay(180);
        const sub = subscriptionsStore.find((item) => item.id === subscriptionId);
        if (!sub) return null;
        sub.cancelAtPeriodEnd = true;
        sub.status = 'cancelled';
        return copy(sub);
    },

    async getWithdrawals(): Promise<WalletWithdrawalItem[]> {
        await delay(120);
        return copy(withdrawalsStore).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },

    async getWithdrawalById(withdrawalId: string): Promise<WalletWithdrawalItem | null> {
        await delay(90);
        const item = withdrawalsStore.find((entry) => entry.id === withdrawalId);
        return item ? copy(item) : null;
    },

    async initiateWithdrawal(payload: WithdrawalRequest): Promise<{ withdrawal: WalletWithdrawalItem; otpChallengeId: string }> {
        await delay(180);
        const next: WalletWithdrawalItem = {
            id: makeId('wd'),
            amount: payload.amount,
            currency: 'GHS',
            network: payload.network,
            phoneNumber: payload.phoneNumber,
            status: 'otp_required',
            createdAt: nowIso(),
        };
        withdrawalsStore.unshift(next);
        const challenge = createOtpChallenge('withdrawal', next.id);
        return { withdrawal: copy(next), otpChallengeId: challenge.id };
    },

    async verifyWithdrawalOtp(withdrawalId: string, challengeId: string, otp: string) {
        await delay(200);
        const withdrawal = withdrawalsStore.find((item) => item.id === withdrawalId);
        if (!withdrawal) return { ok: false as const, message: 'Withdrawal not found.', withdrawal: null };
        const result = resolveOtpChallenge(challengeId, otp, 'withdrawal');
        if (!result.ok) {
            return { ok: false as const, message: result.reason, withdrawal: copy(withdrawal) };
        }

        withdrawal.status = 'pending';
        withdrawal.otpVerifiedAt = nowIso();

        transactionsStore.unshift({
            id: makeId('txn_wd'),
            type: 'withdrawal',
            title: 'Withdrawal Request',
            subtitle: `${withdrawal.network.toUpperCase()} ${withdrawal.phoneNumber}`,
            direction: 'debit',
            amount: withdrawal.amount,
            currency: withdrawal.currency,
            status: 'pending',
            createdAt: withdrawal.createdAt,
        });

        return { ok: true as const, message: 'Withdrawal OTP verified.', withdrawal: copy(withdrawal) };
    },

    async pollWithdrawalStatus(withdrawalId: string): Promise<WalletWithdrawalItem | null> {
        await delay(150);
        const wd = withdrawalsStore.find((item) => item.id === withdrawalId);
        if (!wd) return null;
        if (wd.status === 'completed' || wd.status === 'failed' || wd.status === 'rejected') return copy(wd);

        withdrawalPollCount[withdrawalId] = (withdrawalPollCount[withdrawalId] ?? 0) + 1;
        const p = withdrawalPollCount[withdrawalId];
        if (wd.status === 'pending' && p >= 2) {
            wd.status = 'processing';
        } else if (wd.status === 'processing' && p >= 4) {
            wd.status = wd.id.endsWith('7') ? 'failed' : 'completed';
            if (wd.status === 'failed') {
                wd.failureReason = 'Network timeout at payout processor. Try again.';
            }
            const txn = transactionsStore.find((item) => item.subtitle?.includes(wd.phoneNumber) && item.type === 'withdrawal' && item.createdAt === wd.createdAt);
            if (txn) txn.status = wd.status === 'completed' ? 'completed' : 'failed';
        }
        return copy(wd);
    },

    async seedDemoTipPending(): Promise<SentTipItem> {
        await delay(80);
        const creator = mockCreatorProfiles[Math.floor(Math.random() * mockCreatorProfiles.length)];
        const video = mockVideos[Math.floor(Math.random() * mockVideos.length)];
        const newTip: SentTipItem = {
            tipId: makeId('tip'),
            videoId: video.id,
            creatorUsername: `@${creator.username}`,
            amount: 5 + Math.floor(Math.random() * 35),
            currency: 'GHS',
            status: 'pending',
            createdAt: nowIso(),
            reference: `TIP-${Math.floor(10000 + Math.random() * 90000)}`,
        };
        sentTipsStore.unshift(newTip);
        return copy(newTip);
    },
};

