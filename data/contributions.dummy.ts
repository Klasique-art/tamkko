export interface Contribution {
    contribution_id: string;
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    type: 'contribution' | 'fee' | 'adjustment';
    payment_method: string;
    payment_method_last4: string;
    created_at: string; // ISO datetime
    completed_at: string | null; // ISO datetime
    draw_month: string; // e.g., "February 2026"
    draw_entry_id: string | null;
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank_transfer' | 'ussd';
    brand: 'visa' | 'mastercard' | 'verve' | 'unknown';
    last4: string;
    expiry_month?: string;
    expiry_year?: string;
    is_default: boolean;
}

export const mockPaymentMethods: PaymentMethod[] = [
    {
        id: 'pm_123456789',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiry_month: '12',
        expiry_year: '28',
        is_default: true,
    },
    {
        id: 'pm_987654321',
        type: 'card',
        brand: 'mastercard',
        last4: '8899',
        expiry_month: '05',
        expiry_year: '27',
        is_default: false,
    },
];

export const mockContributions: Contribution[] = [
    {
        contribution_id: "txn_feb_2026_01",
        amount: 20.00,
        currency: "USD",
        status: "completed",
        type: "contribution",
        payment_method: "Visa",
        payment_method_last4: "4242",
        created_at: "2026-02-01T10:15:30Z",
        completed_at: "2026-02-01T10:15:45Z",
        draw_month: "February 2026",
        draw_entry_id: "ent_feb_8832",
    },
    {
        contribution_id: "txn_jan_2026_01",
        amount: 20.00,
        currency: "USD",
        status: "completed",
        type: "contribution",
        payment_method: "MasterCard",
        payment_method_last4: "8899",
        created_at: "2026-01-02T14:20:10Z",
        completed_at: "2026-01-02T14:20:25Z",
        draw_month: "January 2026",
        draw_entry_id: "ent_jan_4521",
    },
    {
        contribution_id: "txn_dec_2025_01",
        amount: 20.00,
        currency: "USD",
        status: "failed",
        type: "contribution",
        payment_method: "Visa",
        payment_method_last4: "4242",
        created_at: "2025-12-05T09:00:00Z",
        completed_at: null,
        draw_month: "December 2025",
        draw_entry_id: null,
    },
    {
        contribution_id: "txn_nov_2025_01",
        amount: 20.00,
        currency: "USD",
        status: "completed",
        type: "contribution",
        payment_method: "PayPal",
        payment_method_last4: "john",
        created_at: "2025-11-03T11:45:00Z",
        completed_at: "2025-11-03T11:46:10Z",
        draw_month: "November 2025",
        draw_entry_id: "ent_nov_1290",
    },
    {
        contribution_id: "txn_oct_2025_01",
        amount: 20.00,
        currency: "USD",
        status: "completed",
        type: "contribution",
        payment_method: "Visa",
        payment_method_last4: "4242",
        created_at: "2025-10-01T08:30:00Z",
        completed_at: "2025-10-01T08:30:15Z",
        draw_month: "October 2025",
        draw_entry_id: "ent_oct_0045",
    },
];
