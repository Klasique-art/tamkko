export interface FairnessProofInput {
    cycle_id: string;
    algorithm_version: string;
    committed_at: string;
    server_seed_hash: string;
    server_seed_reveal: string;
    public_seed_source: string;
    public_seed_value: string;
    published_draw_fingerprint: string;
}

export interface FairnessCheck {
    id: string;
    label: string;
    passed: boolean;
    detail: string;
}

export interface FairnessAuditReport {
    cycle_id: string;
    period: string;
    checks: FairnessCheck[];
    computed_draw_fingerprint: string;
    expected_draw_fingerprint: string;
}

export interface DrawVerificationData {
    id: string;
    draw_id: string;
    month: string;
    status: string;
    total_pool: string;
    prize_per_winner: string;
    number_of_winners: number;
    participants_count: number;
    algorithm: string;
    random_seed: string;
    verification_hash: string;
}

