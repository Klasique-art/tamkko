import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { USE_MOCK_DATA } from '@/config/settings';
import { mockUsers } from '@/data/mock';
import { authStorage } from '@/lib/auth';
import { authEvents } from '@/lib/authEvents';
import { authService } from '@/lib/services/authService';
import { LoginCredentials, SignupData } from '@/types/auth.types';
import { CurrentUser } from '@/types/user.types';

interface AuthContextType {
    user: CurrentUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    verifySignupCode: (email: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const MOCK_SESSION_KEY = '@tamkko_mock_session_active';
const MOCK_USER_EMAIL_KEY = '@tamkko_mock_user_email';

const buildMockUser = (email?: string): CurrentUser => {
    const base = mockUsers[0];
    if (!email) return base;
    return {
        ...base,
        email,
        first_name: email.split('@')[0]?.slice(0, 1).toUpperCase() + email.split('@')[0]?.slice(1) || base.first_name,
    };
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSession, setHasSession] = useState(false);

    const refreshUser = useCallback(async () => {
        if (USE_MOCK_DATA) {
            const email = await AsyncStorage.getItem(MOCK_USER_EMAIL_KEY);
            setUser(buildMockUser(email ?? undefined));
            return;
        }

        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const forceLocalLogout = useCallback(async () => {
        await authStorage.clearTokens();
        await AsyncStorage.multiRemove([MOCK_SESSION_KEY, MOCK_USER_EMAIL_KEY]);
        setHasSession(false);
        setUser(null);
    }, []);

    const shouldForceLogoutOnAuthFailure = (error: any) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) return true;
        const message = String(error?.message || '').toLowerCase();
        return message.includes('network error') || message.includes('unauthorized') || message.includes('forbidden');
    };

    const checkAuth = useCallback(async () => {
        if (USE_MOCK_DATA) {
            try {
                const [session, email] = await Promise.all([
                    AsyncStorage.getItem(MOCK_SESSION_KEY),
                    AsyncStorage.getItem(MOCK_USER_EMAIL_KEY),
                ]);
                const isActive = session === 'true';
                setHasSession(isActive);
                setUser(isActive ? buildMockUser(email ?? undefined) : null);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        try {
            const [accessToken, refreshToken] = await Promise.all([
                authStorage.getAccessToken(),
                authStorage.getRefreshToken(),
            ]);

            if (!accessToken && !refreshToken) {
                setHasSession(false);
                setUser(null);
                return;
            }

            setHasSession(true);

            try {
                await refreshUser();
            } catch (error: any) {
                console.error('[AuthContext] checkAuth refreshUser failed', error);
                if (shouldForceLogoutOnAuthFailure(error)) {
                    await forceLocalLogout();
                }
            }
        } catch (error) {
            console.error('[AuthContext] checkAuth failed', error);
            await forceLocalLogout();
        } finally {
            setIsLoading(false);
        }
    }, [forceLocalLogout, refreshUser]);

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        const unsubscribe = authEvents.onUnauthorized(() => {
            setHasSession(false);
            setUser(null);
        });

        return unsubscribe;
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        if (USE_MOCK_DATA) {
            const nextUser = buildMockUser(credentials.email);
            await AsyncStorage.multiSet([
                [MOCK_SESSION_KEY, 'true'],
                [MOCK_USER_EMAIL_KEY, nextUser.email],
            ]);
            setUser(nextUser);
            setHasSession(true);
            return;
        }

        await authService.login(credentials);
        setHasSession(true);

        try {
            await refreshUser();
        } catch (error) {
            console.error('[AuthContext] login refreshUser failed', error);
            await forceLocalLogout();
        }
    }, [forceLocalLogout, refreshUser]);

    const loginWithGoogle = useCallback(async (idToken: string) => {
        if (USE_MOCK_DATA) {
            void idToken;
            const nextUser = buildMockUser('google.user@tamkko.app');
            await AsyncStorage.multiSet([
                [MOCK_SESSION_KEY, 'true'],
                [MOCK_USER_EMAIL_KEY, nextUser.email],
            ]);
            setUser(nextUser);
            setHasSession(true);
            return;
        }

        await authService.loginWithGoogle(idToken);
        setHasSession(true);

        try {
            await refreshUser();
        } catch (error) {
            console.error('[AuthContext] loginWithGoogle refreshUser failed', error);
            await forceLocalLogout();
        }
    }, [forceLocalLogout, refreshUser]);

    const signup = useCallback(async (data: SignupData) => {
        if (USE_MOCK_DATA) {
            await AsyncStorage.setItem(MOCK_USER_EMAIL_KEY, data.email);
            return;
        }

        try {
            await authService.signup(data);
        } catch (error: any) {
            const dataPreview = (() => {
                const raw = error?.response?.data;
                if (typeof raw === 'string') return raw.slice(0, 500);
                try {
                    return (JSON.stringify(raw) ?? '').slice(0, 500);
                } catch {
                    return '';
                }
            })();

            console.log(
                `[AuthContext] signup failed :: ${JSON.stringify({
                    message: error?.message,
                    status: error?.response?.status,
                    data_preview: dataPreview,
                })}`
            );
            throw error;
        }
    }, []);

    const verifySignupCode = useCallback(async (email: string, code: string) => {
        if (USE_MOCK_DATA) {
            void code;
            await login({ email, password: 'mock_password' });
            return;
        }

        await authService.verifySignupCode({ email, code });

        const pending = await authService.consumePendingSignupCredentials(email);
        if (!pending) throw new Error('Verification failed. Please try again.');

        await login(pending);
    }, [login]);

    const logout = useCallback(async () => {
        if (USE_MOCK_DATA) {
            await forceLocalLogout();
            return;
        }

        await authService.logout();
        setHasSession(false);
        setUser(null);
    }, [forceLocalLogout]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: hasSession,
                login,
                loginWithGoogle,
                signup,
                verifySignupCode,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
