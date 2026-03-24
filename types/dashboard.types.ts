export interface DashboardOverviewResponse {
    success?: boolean;
    data?: DashboardOverviewData;
}

export interface DashboardOverviewData {
    user: {
        user_id: string;
        email: string;
        full_name: string;
    };
    current_month_contribution_status: {
        cycle_id: string;
        cycle_month: string;
        has_paid_this_cycle: boolean;
        payment_state: 'paid' | 'pending' | 'unpaid' | string;
        due_date: string | null;
        draw_entry_id: string | null;
        draw_entry_token: string | null;
        last_payment_reference: string | null;
        last_paid_at: string | null;
    };
    payment_history: Array<{
        payment_id: string;
        amount: number | string;
        currency: string;
        status: string;
        purpose?: string | null;
        payment_method?: {
            card_brand?: string | null;
            card_last4?: string | null;
            bank_name?: string | null;
            account_number?: string | null;
        } | null;
        created_at: string;
        completed_at: string | null;
        month?: string | null;
    }>;
    cycle_context: {
        has_open_draw: boolean;
        active_cycle_id: string;
        active_cycle_month: string;
        distribution_state: string;
        status: string;
        total_pool: number;
        target_pool: number;
        participants_count: number;
    };
    eligibility: {
        cycle_id: string;
        is_eligible: boolean;
        is_entered: boolean;
        entry_id: string | null;
        entry_created_at: string | null;
    };
    impact: {
        total_contributed_amount: number;
        total_contribution_count: number;
        total_draw_entries: number;
    };
    referral_stats: {
        total_referrals: number;
        successful_referrals: number;
    };
}
