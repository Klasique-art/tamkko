export interface ParticipationStats {
    total_contributed_amount: number;
    total_contributions_count: number;
    total_draw_entries: number;
    successful_referrals: number;
    member_since: string; // ISO date
    next_payment_due_date: string; // ISO date
    is_active_member: boolean;
    current_month_status: 'paid' | 'unpaid' | 'pending';
    current_draw_entry_id: string | null;
}

export const mockParticipationStats: ParticipationStats = {
    total_contributed_amount: 320.00,
    total_contributions_count: 16,
    total_draw_entries: 16,
    successful_referrals: 5,
    member_since: "2024-01-15T10:00:00Z",
    next_payment_due_date: "2026-03-01T00:00:00Z",
    is_active_member: true,
    current_month_status: 'paid',
    current_draw_entry_id: "ent_feb_8832"
};
