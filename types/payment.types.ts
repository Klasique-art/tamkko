export interface ApiPaymentMethod {
    id: number;
    type: 'card' | 'bank_transfer' | 'ussd' | string;
    card_brand: string | null;
    card_last4: string | null;
    card_bin: string | null;
    exp_month: string | null;
    exp_year: string | null;
    bank_name: string | null;
    account_number: string | null;
    is_default: boolean;
    is_expired: boolean;
    processor: string;
    created_at: string;
}

export interface InitializePaymentResponseData {
    payment_id: string;
    amount: number | string;
    currency?: string;
    exchange_rate?: number | null;
    reference: string;
    authorization_url: string;
    access_code: string;
    status: string;
}

export interface VerifyPaymentResponseData {
    payment_id: string;
    amount: string;
    currency: string;
    month: string;
    reference: string;
    status: string;
    purpose: string;
    auto_renew: boolean;
    payment_method: ApiPaymentMethod | null;
    created_at: string;
    completed_at: string | null;
}

export interface CurrentMonthStatusData {
    month: string;
    has_paid: boolean;
    payment_id: string | null;
    paid_at: string | null;
    eligible_for_draw: boolean;
    auto_renew_enabled: boolean;
    next_payment_date: string | null;
}

export interface PaymentHistoryItem {
    payment_id: string;
    amount: string;
    currency: string;
    month: string;
    reference: string;
    status: string;
    purpose?: string;
    auto_renew: boolean;
    payment_method: ApiPaymentMethod | null;
    created_at: string;
    completed_at: string | null;
}
