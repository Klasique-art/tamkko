export type TipFlowStep = 'form' | 'awaiting_approval' | 'success';

export type SimulatedTipPayload = {
    creatorHandle: string;
    videoId: string;
    amount: number;
    momoNumber: string;
    currency: string;
    reference: string;
    createdAt: string;
};
