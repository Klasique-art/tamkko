import { FairnessProofInput } from '@/types/fairness.types';

export const mockFairnessProofs: FairnessProofInput[] = [
    {
        cycle_id: 'cyc_jan_2026',
        algorithm_version: 'v1.0_commit_reveal_sha256',
        committed_at: '2026-01-01T00:00:00Z',
        server_seed_hash: '8ba9d8a767ca7d4df5df959796458d6abe2f8ff09245c821164bb3aceec1e3e5',
        server_seed_reveal: 'srv_jan_2026_reveal_9f1b3c88',
        public_seed_source: 'BTC Block #879001 hash',
        public_seed_value: 'btc_block_879001_hash_0000000000000000000f3d9f7b651aa93d8b9f0c1a7b2c6d4e5f6a7b8c9d0e1',
        published_draw_fingerprint: 'f4dc8ffdacde0e300edec21115c34ce7d107528f8db27570fc12954eacc4ce6f',
    },
    {
        cycle_id: 'cyc_dec_2025',
        algorithm_version: 'v1.0_commit_reveal_sha256',
        committed_at: '2025-12-01T00:00:00Z',
        server_seed_hash: '7051f7f8e9bd89dcdafbdc52f0eac319a9420d5a56e3285d1d255e7a4300a28c',
        server_seed_reveal: 'srv_dec_2025_reveal_2a7c11de',
        public_seed_source: 'BTC Block #874732 hash',
        public_seed_value: 'btc_block_874732_hash_00000000000000000008c21aa94f3b7e9a6c2d1f7b5e4d3c2b1a09876543210f',
        published_draw_fingerprint: '21b19f946675557b8b1f969ba1d5f31636e1bca3996e1719bd61121596559b17',
    },
    {
        cycle_id: 'cyc_nov_2025',
        algorithm_version: 'v1.0_commit_reveal_sha256',
        committed_at: '2025-11-01T00:00:00Z',
        server_seed_hash: '4779fea2878a3ef72e50b54c64da58824e835ebe4b06ae8a3da90ce34235f3b9',
        server_seed_reveal: 'srv_nov_2025_reveal_b41f77aa',
        public_seed_source: 'BTC Block #870411 hash',
        public_seed_value: 'btc_block_870411_hash_0000000000000000000aa7e3d6c2f1b9e8d7c6b5a4f3210fedcba9876543210a',
        published_draw_fingerprint: '75c2864f3e99260be165f86d07bf284c0d28a09f210ca20cd6268a935c0b8c0d',
    },
];

