import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { authStorage } from '@/lib/auth';
import client from '@/lib/client';
import { CurrentUser } from '@/types/user.types';
import {
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    SignupRequest,
    SignupResponse,
    ResendVerificationCodeRequest,
    ResendVerificationCodeResponse,
    VerifySignupCodeRequest,
    VerifySignupCodeResponse,
} from '@/types/auth.types';

const DEVICE_ID_STORAGE_KEY = 'thefourthbook_device_id';

const resolveDeviceId = async () => {
    const existing = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;
    const generated =
        typeof (Crypto as any).randomUUID === 'function'
            ? (Crypto as any).randomUUID()
            : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
    return generated;
};

const buildDeviceInfo = async (): Promise<GoogleLoginRequest['device_info']> => {
    const deviceId = await resolveDeviceId();
    return {
        device_id: deviceId,
        device_name: Constants.deviceName || Platform.OS,
        platform: Platform.OS,
        app_version: Constants.expoConfig?.version || '1.0.0',
    };
};

const toErrorPreview = (data: unknown): string | unknown => {
    const truncateToWords = (input: string, maxWords = 500) => {
        const words = input.trim().split(/\s+/);
        if (words.length <= maxWords) return input;
        return `${words.slice(0, maxWords).join(' ')} ...[truncated]`;
    };

    if (typeof data === 'string') return truncateToWords(data, 500);
    try {
        return truncateToWords(JSON.stringify(data), 500);
    } catch {
        return data;
    }
};

const extractFirstErrorText = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    if (Array.isArray(value)) {
        for (const item of value) {
            const found = extractFirstErrorText(item);
            if (found) return found;
        }
        return null;
    }
    if (value && typeof value === 'object') {
        for (const nested of Object.values(value as Record<string, unknown>)) {
            const found = extractFirstErrorText(nested);
            if (found) return found;
        }
    }
    return null;
};

const toReadableError = (error: any): string => {
    const data = error?.response?.data;
    return (
        extractFirstErrorText(data?.errors) ||
        extractFirstErrorText(data?.error?.details?.error?.details) ||
        extractFirstErrorText(data?.error?.details?.error?.message) ||
        extractFirstErrorText(data?.error?.details?.message) ||
        extractFirstErrorText(data?.error?.details) ||
        extractFirstErrorText(data?.error?.message) ||
        extractFirstErrorText(data?.detail) ||
        extractFirstErrorText(data?.message) ||
        extractFirstErrorText(data?.error) ||
        error?.message ||
        'Request failed'
    );
};

const logApiError = (scope: string, error: any) => {
    const status = error?.response?.status;
    const readableMessage = toReadableError(error);
    const method = String(error?.config?.method || 'POST').toUpperCase();
    const baseURL = error?.config?.baseURL || '';
    const requestUrl = error?.config?.url || '';
    const fullUrl =
        /^https?:\/\//i.test(requestUrl)
            ? requestUrl
            : `${String(baseURL).replace(/\/+$/, '')}/${String(requestUrl).replace(/^\/+/, '')}`;
    const requestDataRaw = error?.config?.data;
    let requestPayload: unknown = requestDataRaw;
    if (typeof requestDataRaw === 'string') {
        try {
            requestPayload = JSON.parse(requestDataRaw);
        } catch {
            requestPayload = requestDataRaw;
        }
    }

    const payload = {
        method,
        full_url: fullUrl,
        request_url: requestUrl,
        base_url: baseURL,
        request_payload: requestPayload,
        status,
        message: readableMessage,
        error_message: error?.message,
        response_data: error?.response?.data,
        data_preview: toErrorPreview(error?.response?.data),
    };
    console.log(`[authService] ${scope} failed :: ${JSON.stringify(payload)}`);
};

const extractToken = (source: unknown, keys: string[]): string | null => {
    const read = (obj: unknown, keyPath: string[]): unknown => {
        let current: unknown = obj;
        for (const key of keyPath) {
            if (!current || typeof current !== 'object' || !(key in (current as Record<string, unknown>))) {
                return undefined;
            }
            current = (current as Record<string, unknown>)[key];
        }
        return current;
    };

    for (const key of keys) {
        const keyPath = key.split('.');
        const value = read(source, keyPath);
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }

    return null;
};

export const authService = {
    pendingSignupCredentials: null as LoginRequest | null,

    async signup(payload: SignupRequest): Promise<SignupResponse> {
        try {
            const normalizedPayload: SignupRequest = {
                ...payload,
                email: payload.email.trim().toLowerCase(),
                username: payload.username.trim().toLowerCase(),
            };

            const response = await client.post('/auth/register/', normalizedPayload);
            const pendingCredentials = {
                emailOrUsername: normalizedPayload.email,
                password: normalizedPayload.password,
            };
            authService.pendingSignupCredentials = pendingCredentials;
            await authStorage.setPendingSignupCredentials(
                pendingCredentials.email,
                pendingCredentials.password
            );
            return response.data;
        } catch (error) {
            logApiError('signup', error);
            throw error;
        }
    },

    async login(payload: LoginRequest): Promise<LoginResponse> {
        try {
            const normalizedPayload: LoginRequest = {
                ...payload,
                emailOrUsername: payload.emailOrUsername.trim().toLowerCase(),
            };

            let response;
            try {
                response = await client.post('/auth/login', normalizedPayload);
            } catch (error: any) {
                if (error?.response?.status && error.response.status !== 404) {
                    throw error;
                }
                response = await client.post('/auth/login/', normalizedPayload);
            }
            const responseData = response.data;

            const access = extractToken(responseData, [
                'access',
                'tokens.access',
                'data.access',
                'data.tokens.access',
            ]);
            const refresh = extractToken(responseData, [
                'refresh',
                'tokens.refresh',
                'data.refresh',
                'data.tokens.refresh',
            ]);

            if (!access || !refresh) {
                throw new Error(
                    `Login response missing token strings. Payload preview: ${
                        typeof responseData === 'string'
                            ? responseData.slice(0, 500)
                            : JSON.stringify(responseData).slice(0, 500)
                    }`
                );
            }

            await authStorage.setTokens(access, refresh);
            return { access, refresh };
        } catch (error) {
            logApiError('login', error);
            throw error;
        }
    },

    async loginWithGoogle(idToken: string): Promise<LoginResponse> {
        try {
            const deviceInfo = await buildDeviceInfo();
            const response = await client.post('/auth/google/', {
                id_token: idToken,
                device_info: deviceInfo,
            });
            const responseData = response.data;

            const access = extractToken(responseData, [
                'access',
                'tokens.access',
                'data.access',
                'data.tokens.access',
            ]);
            const refresh = extractToken(responseData, [
                'refresh',
                'tokens.refresh',
                'data.refresh',
                'data.tokens.refresh',
            ]);

            const sessionId = extractToken(responseData, [
                'session_id',
                'session.id',
                'data.session_id',
                'data.session.session_id',
                'data.session.id',
            ]);

            if (!access || !refresh) {
                throw new Error(
                    `Google login response missing token strings. Payload preview: ${
                        typeof responseData === 'string'
                            ? responseData.slice(0, 500)
                            : JSON.stringify(responseData).slice(0, 500)
                    }`
                );
            }

            await authStorage.setTokens(access, refresh);
            if (sessionId) {
                await authStorage.setSessionId(sessionId);
            }

            return { access, refresh };
        } catch (error) {
            logApiError('loginWithGoogle', error);
            throw error;
        }
    },

    async getCurrentUser(): Promise<CurrentUser> {
        try {
            let response;
            try {
                response = await client.get('/auth/me');
            } catch (error: any) {
                if (error?.response?.status && error.response.status !== 404) {
                    throw error;
                }
                response = await client.get('/auth/me/');
            }

            const payload = response.data as
                | CurrentUser
                | { data?: CurrentUser; user?: CurrentUser; status?: string }
                | { data?: { user?: CurrentUser }; status?: string };

            return (
                (payload as { data?: { user?: CurrentUser } })?.data?.user ||
                (payload as { data?: CurrentUser })?.data ||
                (payload as { user?: CurrentUser })?.user ||
                (payload as CurrentUser)
            );
        } catch (error) {
            logApiError('getCurrentUser', error);
            throw error;
        }
    },

    async logout(): Promise<void> {
        try {
            const [sessionId, refreshToken] = await Promise.all([
                authStorage.getSessionId(),
                authStorage.getRefreshToken(),
            ]);

            const payload = refreshToken
                ? { refresh_token: refreshToken }
                : sessionId
                    ? { session_id: sessionId }
                    : { logout_all_devices: true };

            try {
                await client.post('/auth/logout', payload);
            } catch (error: any) {
                if (error?.response?.status && error.response.status !== 404) {
                    throw error;
                }
                await client.post('/auth/logout/', payload);
            }
        } catch (error) {
            logApiError('logout', error);
        } finally {
            await Promise.all([
                authStorage.clearTokens(),
                authStorage.clearPendingSignupCredentials(),
            ]);
            authService.pendingSignupCredentials = null;
        }
    },

    async verifySignupCode(payload: VerifySignupCodeRequest): Promise<VerifySignupCodeResponse> {
        try {
            const response = await client.post('/auth/verify-email/', payload);
            return response.data;
        } catch (error) {
            logApiError('verifySignupCode', error);
            throw error;
        }
    },

    async resendVerificationCode(
        payload: ResendVerificationCodeRequest
    ): Promise<ResendVerificationCodeResponse> {
        try {
            const response = await client.post('/auth/resend-verification/', payload);
            return response.data;
        } catch (error) {
            logApiError('resendVerificationCode', error);
            throw error;
        }
    },

    async setPassword(payload: {
        current_password: string;
        new_password: string;
        re_new_password: string;
    }): Promise<Record<string, unknown>> {
        try {
            const response = await client.post('/auth/users/set_password/', payload);
            return response.data;
        } catch (error) {
            logApiError('setPassword', error);
            throw error;
        }
    },

    clearPendingSignupCredentials() {
        authService.pendingSignupCredentials = null;
    },

    async consumePendingSignupCredentials(email: string): Promise<LoginRequest | null> {
        const fromMemory = authService.pendingSignupCredentials;
        if (fromMemory && fromMemory.emailOrUsername === email) {
            await authStorage.clearPendingSignupCredentials();
            authService.pendingSignupCredentials = null;
            return fromMemory;
        }

        const fromSecureStore = await authStorage.getPendingSignupCredentials();
        if (fromSecureStore && fromSecureStore.email === email) {
            await authStorage.clearPendingSignupCredentials();
            authService.pendingSignupCredentials = null;
            return fromSecureStore;
        }

        return null;
    },
};
