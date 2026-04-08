import AsyncStorage from '@react-native-async-storage/async-storage';

import { CurrentUser } from '@/types/user.types';

type TwoFactorMethod = 'authenticator' | 'sms';

export type ProfileDraft = {
    firstName: string;
    lastName: string;
    bio: string;
    website: string;
    phone: string;
};

export type TwoFactorState = {
    enabled: boolean;
    method: TwoFactorMethod;
    backupCodes: string[];
    lastUpdatedAt: string;
};

export type SessionState = {
    id: string;
    deviceName: string;
    location: string;
    lastSeenAt: string;
    isCurrent: boolean;
};

export type AccountSettingsState = {
    email: string;
    phone: string;
    privateAccount: boolean;
    discoverableByPhone: boolean;
    creatorModeEnabled: boolean;
    accountState: 'active' | 'deactivated' | 'deletion_pending';
};

type SecurityStoreShape = {
    profile: ProfileDraft;
    twoFactor: TwoFactorState;
    sessions: SessionState[];
    account: AccountSettingsState;
};

const SECURITY_STORAGE_KEY = '@tamkko_security_center_state_v1';

const createBackupCodes = () =>
    Array.from({ length: 8 }, (_, index) => `${index + 1}${Math.floor(100000 + Math.random() * 899999)}`);

const nowIso = () => new Date().toISOString();

const buildDefaultState = (user: CurrentUser | null): SecurityStoreShape => {
    const currentTime = nowIso();
    return {
        profile: {
            firstName: user?.first_name ?? 'Creator',
            lastName: user?.last_name ?? 'User',
            bio: 'Creator on Tamkko.',
            website: '',
            phone: user?.phone ?? '',
        },
        twoFactor: {
            enabled: false,
            method: 'authenticator',
            backupCodes: createBackupCodes(),
            lastUpdatedAt: currentTime,
        },
        sessions: [
            {
                id: 'sess_current',
                deviceName: 'Current Device',
                location: 'Accra, GH',
                lastSeenAt: currentTime,
                isCurrent: true,
            },
            {
                id: 'sess_002',
                deviceName: 'Chrome on Windows',
                location: 'Kumasi, GH',
                lastSeenAt: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
                isCurrent: false,
            },
            {
                id: 'sess_003',
                deviceName: 'Android App',
                location: 'Cape Coast, GH',
                lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
                isCurrent: false,
            },
        ],
        account: {
            email: user?.email ?? 'creator@tamkko.app',
            phone: user?.phone ?? '',
            privateAccount: false,
            discoverableByPhone: true,
            creatorModeEnabled: true,
            accountState: 'active',
        },
    };
};

let memoryState: SecurityStoreShape | null = null;

const readState = async (user: CurrentUser | null): Promise<SecurityStoreShape> => {
    if (memoryState) return memoryState;
    try {
        const stored = await AsyncStorage.getItem(SECURITY_STORAGE_KEY);
        if (stored) {
            memoryState = JSON.parse(stored) as SecurityStoreShape;
            return memoryState;
        }
    } catch {}
    memoryState = buildDefaultState(user);
    return memoryState;
};

const persistState = async (state: SecurityStoreShape) => {
    memoryState = state;
    await AsyncStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(state));
};

export const mockProfileSecurityService = {
    async load(user: CurrentUser | null) {
        return readState(user);
    },

    async updateProfile(user: CurrentUser | null, patch: Partial<ProfileDraft>) {
        const state = await readState(user);
        const next: SecurityStoreShape = { ...state, profile: { ...state.profile, ...patch } };
        await persistState(next);
        return next.profile;
    },

    async updateAccountSettings(user: CurrentUser | null, patch: Partial<AccountSettingsState>) {
        const state = await readState(user);
        const next: SecurityStoreShape = { ...state, account: { ...state.account, ...patch } };
        await persistState(next);
        return next.account;
    },

    async setupTwoFactor(user: CurrentUser | null, method: TwoFactorMethod, verificationCode: string) {
        void verificationCode;
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            twoFactor: {
                enabled: true,
                method,
                backupCodes: state.twoFactor.backupCodes.length ? state.twoFactor.backupCodes : createBackupCodes(),
                lastUpdatedAt: nowIso(),
            },
        };
        await persistState(next);
        return next.twoFactor;
    },

    async disableTwoFactor(user: CurrentUser | null, verificationCode: string) {
        void verificationCode;
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            twoFactor: { ...state.twoFactor, enabled: false, lastUpdatedAt: nowIso() },
        };
        await persistState(next);
        return next.twoFactor;
    },

    async regenerateBackupCodes(user: CurrentUser | null) {
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            twoFactor: {
                ...state.twoFactor,
                backupCodes: createBackupCodes(),
                lastUpdatedAt: nowIso(),
            },
        };
        await persistState(next);
        return next.twoFactor.backupCodes;
    },

    async revokeSession(user: CurrentUser | null, sessionId: string) {
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            sessions: state.sessions.filter((item) => item.id !== sessionId || item.isCurrent),
        };
        await persistState(next);
        return next.sessions;
    },

    async revokeAllOtherSessions(user: CurrentUser | null) {
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            sessions: state.sessions.filter((item) => item.isCurrent),
        };
        await persistState(next);
        return next.sessions;
    },

    async deactivateAccount(user: CurrentUser | null, reason: string) {
        void reason;
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            account: { ...state.account, accountState: 'deactivated' },
        };
        await persistState(next);
        return next.account;
    },

    async requestDeleteAccount(user: CurrentUser | null, confirmationText: string) {
        const normalized = confirmationText.trim().toUpperCase();
        if (normalized !== 'DELETE') return { ok: false as const };
        const state = await readState(user);
        const next: SecurityStoreShape = {
            ...state,
            account: { ...state.account, accountState: 'deletion_pending' },
        };
        await persistState(next);
        return { ok: true as const, account: next.account };
    },
};
