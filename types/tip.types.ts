export type TipRecord = {
    tipId: string;
    videoId: string;
    senderUserId: string;
    recipientUserId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
};
